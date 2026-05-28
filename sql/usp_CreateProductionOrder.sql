CREATE PROCEDURE amir.usp_CreateProductionOrder
    @Input_CarModelID NVARCHAR(50),
    @Input_VIN NVARCHAR(255),
    @Input_EngineNumber NVARCHAR(255),
    @Input_User NVARCHAR(255),
    @Output_NewID NVARCHAR(50) OUTPUT
AS
BEGIN
    -- Menonaktifkan pesan baris yang terpengaruh untuk optimalisasi performa
    SET NOCOUNT ON;

    -- 1. VALIDASI: Pastikan tipe mobil (Car Model) terdaftar di tabel master
    IF NOT EXISTS (SELECT 1 FROM amir.TB_M_CAR_MODEL WHERE ID = @Input_CarModelID)
    BEGIN
        THROW 50005, 'Validasi Gagal: Car Model tidak ditemukan!', 1;
    END

    -- 2. VALIDASI: Pastikan VIN belum pernah digunakan (harus unik)
    IF EXISTS (SELECT 1 FROM amir.TB_R_PRODUCTION WHERE VIN = @Input_VIN)
    BEGIN
        THROW 50006, 'Validasi Gagal: VIN sudah digunakan!', 1;
    END

    -- 3. VALIDASI: Pastikan Nomor Mesin belum pernah digunakan (harus unik)
    IF EXISTS (SELECT 1 FROM amir.TB_R_PRODUCTION WHERE ENGINE_NUMBER = @Input_EngineNumber)
    BEGIN
        THROW 50007, 'Validasi Gagal: Engine Number sudah digunakan!', 1;
    END

    -- 4. VALIDASI: Pastikan model mobil ini sudah memiliki racikan Bill of Materials (BOM)
    IF NOT EXISTS (SELECT 1 FROM amir.TB_M_BOM WHERE CAR_MODEL_ID = @Input_CarModelID)
    BEGIN
        THROW 50008, 'Validasi Gagal: Bill of Materials (BOM) tidak didefinisikan untuk model ini!', 1;
    END

    -- 5. VALIDASI STOK: Periksa apakah ada material di BOM yang stok inventory-nya kurang
    IF EXISTS (
        SELECT 1
        FROM amir.TB_M_BOM b
        JOIN amir.TB_R_INVENTORY i ON b.INVENTORY_ID = i.ID
        WHERE b.CAR_MODEL_ID = @Input_CarModelID
          AND i.QUANTITY < b.QTY_REQUIRED
    )
    BEGIN
        -- Susun pesan error dinamis untuk memberitahukan material mana saja yang kurang stok
        DECLARE @ErrorMsg NVARCHAR(2000) = 'Validasi Gagal: Stok tidak mencukupi untuk material: ';
        
        SELECT @ErrorMsg = @ErrorMsg + m.NAME + ' (Butuh: ' + CAST(b.QTY_REQUIRED AS VARCHAR(10)) + ', Stok: ' + CAST(i.QUANTITY AS VARCHAR(10)) + '), '
        FROM amir.TB_M_BOM b
        JOIN amir.TB_R_INVENTORY i ON b.INVENTORY_ID = i.ID
        JOIN amir.TB_M_MATERIAL m ON i.MATERIAL_ID = m.ID
        WHERE b.CAR_MODEL_ID = @Input_CarModelID
          AND i.QUANTITY < b.QTY_REQUIRED;
           
        -- Hapus koma dan spasi terakhir dari string pesan error
        SET @ErrorMsg = SUBSTRING(@ErrorMsg, 1, LEN(@ErrorMsg) - 1);
        
        THROW 50009, @ErrorMsg, 1;
    END

    -- 6. GENERATE KEY: Buat ID Produksi baru secara otomatis dengan prefix 'PRD'
    EXEC amir.usp_GenerateBusinessKey 
        @Input_Prefix = 'PRD', 
        @Output_NewID = @Output_NewID OUTPUT;

    -- 7. PROSES TRANSAKSI (ACID): Jalankan serangkaian query modifikasi data
    BEGIN TRY
        BEGIN TRAN;

            -- A. Masukkan data header perintah produksi baru ke TB_R_PRODUCTION
            INSERT INTO amir.TB_R_PRODUCTION (
                ID, PRODUCTION_ORDER_NO, CAR_MODEL_ID, VIN, ENGINE_NUMBER, START_DATE, STATUS, CREATED_BY, CREATED_DT
            )
            VALUES (
                @Output_NewID, @Output_NewID, @Input_CarModelID, @Input_VIN, @Input_EngineNumber, GETDATE(), 'In Progress', @Input_User, GETDATE()
            );

            -- Deklarasikan variabel untuk iterasi Cursor BOM
            DECLARE @Var_InventoryID NVARCHAR(50);
            DECLARE @Var_MaterialID NVARCHAR(50);
            DECLARE @Var_QtyRequired INT;
            DECLARE @Var_CurrentQuantity DECIMAL(18,0);

            -- B. Buat Cursor untuk memproses setiap bahan baku yang dibutuhkan dari BOM satu-per-satu
            DECLARE BomCursor CURSOR LOCAL FAST_FORWARD FOR
            SELECT b.INVENTORY_ID, i.MATERIAL_ID, b.QTY_REQUIRED, i.QUANTITY
            FROM amir.TB_M_BOM b
            JOIN amir.TB_R_INVENTORY i ON b.INVENTORY_ID = i.ID
            WHERE b.CAR_MODEL_ID = @Input_CarModelID;

            OPEN BomCursor;
            FETCH NEXT FROM BomCursor INTO @Var_InventoryID, @Var_MaterialID, @Var_QtyRequired, @Var_CurrentQuantity;

            -- @@FETCH_STATUS akan bernilai 0 selama masih ada data yang berhasil di-fetch dari cursor
            WHILE @@FETCH_STATUS = 0
            BEGIN
                -- B.1. Potong kuantitas stok bahan baku di tabel Inventory
                UPDATE amir.TB_R_INVENTORY
                SET QUANTITY = QUANTITY - @Var_QtyRequired,
                    CHANGED_BY = @Input_User,
                    CHANGED_DT = GETDATE()
                WHERE ID = @Var_InventoryID;

                -- B.2. Catat pemakaian material ke tabel detail konsumsi produksi
                DECLARE @ProdMatID NVARCHAR(50) = NEWID();
                INSERT INTO amir.TB_R_PRODUCTION_MATERIAL (
                    ID, PRODUCTION_ID, MATERIAL_ID, QUANTITY_CONSUMED, CREATED_BY, CREATED_DT
                )
                VALUES (
                    @ProdMatID, @Output_NewID, @Var_MaterialID, @Var_QtyRequired, @Input_User, GETDATE()
                );

                -- B.3. Log histori mutasi keluar (OUT) stok di TB_H_INVENTORY_LOG beserta sisa saldo (balance)
                DECLARE @InvLogID NVARCHAR(50) = NEWID();
                INSERT INTO amir.TB_H_INVENTORY_LOG (
                    ID, INVENTORY_ID, MOVEMENT_TYPE, QUANTITY, BALANCE, REFERENCE_NO, CREATED_BY, CREATED_DT
                )
                VALUES (
                    @InvLogID, @Var_InventoryID, 'OUT', @Var_QtyRequired, @Var_CurrentQuantity - @Var_QtyRequired, @Output_NewID, @Input_User, GETDATE()
                );

                FETCH NEXT FROM BomCursor INTO @Var_InventoryID, @Var_MaterialID, @Var_QtyRequired, @Var_CurrentQuantity;
            END;

            -- Tutup dan bersihkan cursor
            CLOSE BomCursor;
            DEALLOCATE BomCursor;

            -- C. Catat perubahan status awal produksi menjadi 'In Progress' ke log history produksi
            DECLARE @ProdLogID NVARCHAR(50) = NEWID();
            INSERT INTO amir.TB_H_PRODUCTION_LOG (
                ID, PRODUCTION_ID, PREVIOUS_STATUS, NEW_STATUS, OPERATOR_ID, NOTES, CREATED_BY, CREATED_DT
            )
            VALUES (
                @ProdLogID, @Output_NewID, NULL, 'In Progress', @Input_User, 'Production order created and inventory consumed.', @Input_User, GETDATE()
            );

        -- Jika seluruh proses di atas berhasil tanpa kendala, simpan permanen perubahan ke database
        COMMIT TRAN;
    END TRY
    BEGIN CATCH
        -- Batalkan (Rollback) seluruh perubahan database jika ada query yang gagal di tengah proses
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        
        -- Pastikan cursor ditutup dan didealokasi jika error terjadi di tengah-tengah perulangan cursor
        IF CURSOR_STATUS('local', 'BomCursor') >= 0
        BEGIN
            CLOSE BomCursor;
            DEALLOCATE BomCursor;
        END;

        -- Lempar kembali pesan error untuk ditangkap oleh backend API
        ;THROW;
    END CATCH
END;
