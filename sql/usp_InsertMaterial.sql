-- sp insert material
CREATE  PROCEDURE amir.usp_InsertMaterial
	--PARAMETER
	@Input_PartNumber nvarchar(255),
	@Input_Name nvarchar(255),
	@Input_Category nvarchar(255),
	@Input_Unit nvarchar(255),
	@Input_SupplierID nvarchar(255),
	@Input_User nvarchar(255)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
	
	IF EXISTS (SELECT 1 FROM amir.TB_M_MATERIAL WHERE PART_NUMBER = @Input_PartNumber)
	BEGIN
		THROW 50001, 'Validasi Gagal: Part Number tersebut sudah terdaftar di sistem!', 1;
	END
	
	IF NOT EXISTS (SELECT 1 FROM amir.TB_M_SUPPLIER WHERE ID = @Input_SupplierID)
	BEGIN
		THROW 50002, 'Validasi Gagal: Supplier ID tidak terdaftar!', 1;
	END
	
	DECLARE @New_MaterialID varchar(50);
	
	EXEC amir.usp_GenerateBusinessKey
		@Input_Prefix = 'MAT',
		@Output_NewID = @New_MaterialID OUTPUT;

	BEGIN TRAN;
		INSERT INTO amir.TB_M_MATERIAL 
		(ID, PART_NUMBER, NAME, CATEGORY, UNIT, 
		SUPPLIER_ID, CREATED_DT, CREATED_BY, CHANGED_DT,
		CHANGED_BY)
		VALUES
		(@New_MaterialID, @Input_PartNumber, @Input_Name, 
		@Input_Category, @Input_Unit, @Input_SupplierID,
		GETDATE(), @Input_User, null, null)
	COMMIT TRAN;
	
	PRINT 'SUKSES: Material [' + @Input_Name + '] berhasil ditambahkan dengan
	ID: ' + @New_MaterialID;
	
	END TRY
	BEGIN CATCH
		IF @@TRANCOUNT > 0 ROLLBACK TRAN;
		PRINT 'ERROR: ' + ERROR_MESSAGE();
		THROW;
	END CATCH	
END

