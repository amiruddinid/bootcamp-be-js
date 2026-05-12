CREATE PROCEDURE amir.usp_CreateOrderMaterial
    @Input_ID_Material NVARCHAR(50),
    @Input_Qty_Order DECIMAL(18,0),
    @Input_User NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Var_SupplierID NVARCHAR(50);
    DECLARE @New_OrderID NVARCHAR(50);

    BEGIN TRY
        -- 1. Mengambil Data Referensi
        SELECT @Var_SupplierID = SUPPLIER_ID
        FROM amir.TB_M_MATERIAL
        WHERE ID = @Input_ID_Material;

        -- 2. Validasi Bisnis
        IF @Var_SupplierID IS NULL
        BEGIN
            THROW 50001, 'Validasi Gagal: Material tidak terdaftar!', 1;
        END

        -- 3. Mendapatkan ID Order Baru secara Otomatis
        EXEC amir.usp_GenerateBusinessKey 
            @Input_Prefix = 'ORD', 
            @Output_NewID = @New_OrderID OUTPUT;

        -- 4. Memulai Transaksi
        BEGIN TRAN;

            -- ==========================================
            -- LATIHAN: INSERT HEADER SURAT JALAN
            -- Instruksi: Tulis perintah INSERT INTO untuk tabel amir.TB_R_MATERIAL_RECEIPT.
            -- Masukkan data ke dalam 6 kolom berikut secara berurutan:
            -- 1. ID (Gunakan variabel @New_OrderID)
            -- 2. RECEIPT_NUMBER (Gunakan variabel @New_OrderID)
            -- 3. SUPPLIER_ID (Gunakan variabel @Var_SupplierID)
            -- 4. STATUS (Tulis teks statis: 'Draft Order')
            -- 5. CREATED_BY (Gunakan variabel @Input_User)
            -- 6. CREATED_DT (Gunakan fungsi SQL untuk mengambil waktu server saat ini)
            -- ==========================================
            
            INSERT INTO amir.TB_R_MATERIAL_RECEIPT 
            (ID, RECEIPT_NUMBER, SUPPLIER_ID, STATUS, CREATED_BY, CREATED_DT)
            VALUES 
            (@New_OrderID, @New_OrderID, @Var_SupplierID, 'Draft Order', @Input_User, GETDATE());

            -- 5. Insert Detail Order
            INSERT INTO amir.TB_R_RECEIPT_DETAIL 
            (ID, RECEIPT_ID, MATERIAL_ID, QUANTITY_RECEIVED)
            VALUES 
            (NEWID(), @New_OrderID, @Input_ID_Material, @Input_Qty_Order);

        -- Permanenkan data
        COMMIT TRAN;
        PRINT 'Order Berhasil Dibuat dengan ID: ' + @New_OrderID;

    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        PRINT 'ERROR: ' + ERROR_MESSAGE();
    END CATCH
END;