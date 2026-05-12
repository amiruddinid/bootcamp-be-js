CREATE PROCEDURE amir.usp_ApproveOrderMaterial_Latihan
    @Input_OrderID NVARCHAR(50),
    @Input_User NVARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;

    -- Variabel untuk menyimpan status order saat ini di database
    DECLARE @CurrentStatus NVARCHAR(50);

    BEGIN TRY
        -- ==========================================
        -- LATIHAN 1: MEMBACA STATUS SAAT INI
        -- Instruksi: Tulis query SELECT untuk mengambil nilai dari kolom STATUS 
        -- pada tabel amir.TB_R_MATERIAL_RECEIPT berdasarkan @Input_OrderID.
        -- Masukkan hasilnya ke dalam variabel @CurrentStatus.
        -- ==========================================
        
        SELECT @CurrentStatus = STATUS
        FROM amir.TB_R_MATERIAL_RECEIPT
        WHERE ID = @Input_OrderID;


        -- ==========================================
        -- LATIHAN 2: VALIDASI EKSISTENSI DATA
        -- Instruksi: Buat logika IF. Jika @CurrentStatus bernilai NULL 
        -- (artinya ID Order tidak ditemukan di tabel), hentikan program 
        -- dengan THROW error 50003 dan pesan 'Order tidak ditemukan!'.
        -- ==========================================
        
        IF @CurrentStatus IS NULL
        BEGIN
            THROW 50003, 'Validasi Gagal: Order tidak ditemukan di sistem!', 1;
        END


        -- ==========================================
        -- LATIHAN 3: VALIDASI STATE BISNIS (STATE MACHINE)
        -- Instruksi: Buat logika IF. Jika @CurrentStatus BUKAN 'Draft Order',
        -- hentikan program dengan THROW error 50004 dan pesan 
        -- 'Gagal: Hanya pesanan berstatus Draft yang dapat disetujui!'.
        -- ==========================================
        
        IF @CurrentStatus <> 'Draft Order' -- Bisa juga menggunakan !=
        BEGIN
            THROW 50004, 'Validasi Gagal: Hanya pesanan berstatus Draft yang dapat disetujui!', 1;
        END


        -- Memulai Transaksi Aman
        BEGIN TRAN;

            -- ==========================================
            -- LATIHAN 4: UPDATE DATA (DML)
            -- Instruksi: Tulis perintah UPDATE untuk tabel amir.TB_R_MATERIAL_RECEIPT.
            -- Ubah nilai kolom STATUS menjadi 'Approved'.
            -- (Asumsikan ada kolom UPDATED_BY dan UPDATED_DT di tabel tersebut).
            -- Isi UPDATED_BY dengan @Input_User dan UPDATED_DT dengan waktu server saat ini.
            -- Pastikan Anda menggunakan klausa WHERE agar tidak semua baris ter-update!
            -- ==========================================
            
            UPDATE amir.TB_R_MATERIAL_RECEIPT
        	SET STATUS = 'Approved',
            	CHANGED_BY = @Input_User,
            	CHANGED_DT = GETDATE()
        	WHERE ID = @Input_OrderID; -- SANGAT KRUSIAL!

        -- Permanenkan Perubahan
        COMMIT TRAN;
        PRINT 'SUKSES: Order ' + @Input_OrderID + ' berhasil disetujui (Approved).';

    END TRY
    BEGIN CATCH
        -- Rollback jika terjadi kesalahan di tengah transaksi
        IF @@TRANCOUNT > 0 ROLLBACK TRAN;
        
        PRINT 'ERROR: ' + ERROR_MESSAGE();
        THROW;
    END CATCH
END;