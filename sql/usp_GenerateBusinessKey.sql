CREATE PROCEDURE amir.usp_GenerateBusinessKey
	@Input_Prefix VARCHAR(10),
	@Output_NewID VARCHAR(50) OUTPUT
AS
BEGIN
	SET NOCOUNT ON;

	DECLARE @CurrentYearMonth varchar(6) = 
		FORMAT(GETDATE(), 'yyyyMM');
	DECLARE @NextSequence int;
	
	BEGIN TRY
		BEGIN TRAN;
			
		update amir.TB_M_SEQUENCE WITH (UPDLOCK, ROWLOCK)
		SET @NextSequence = LAST_SEQUENCE = LAST_SEQUENCE + 1 
		WHERE PREFIX = @Input_Prefix 
		AND YEAR_MONTH = @CurrentYearMonth;
		
		IF @@ROWCOUNT = 0
		BEGIN
			SET @NextSequence = 1;
			INSERT INTO amir.TB_M_SEQUENCE (PREFIX, YEAR_MONTH, 
			LAST_SEQUENCE) VALUES(@Input_Prefix, @CurrentYearMonth,
			@NextSequence);
		END
		
		COMMIT TRAN;
		
		SET @Output_NewID = @Input_Prefix + @CurrentYearMonth +
			RIGHT('000000' + CAST(@NextSequence AS VARCHAR(10)), 6);
			
	END TRY
	BEGIN CATCH
		IF @@TRANCOUNT > 0 ROLLBACK TRAN;
		THROW;
	END CATCH
END;
