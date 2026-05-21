CREATE TABLE amir.TB_M_ROLE (
	ID int IDENTITY(1,1) PRIMARY KEY,
	ROLE_NAME varchar(50) not null,
	CREATED_DT datetime not null default(getdate()),
	CREATED_BY varchar(50) not null,
	CHANGED_DT datetime,
	CHANGED_BY varchar(50)
);

CREATE TABLE amir.TB_M_USER (
	USERNAME varchar(50) primary key,
	PASSWORD varchar(255) not null,
	NOREG varchar(10) not null,
	EMAIL varchar(50) not null,
	ROLE_ID int not null,
	CREATED_DT datetime not null default(getdate()),
	CREATED_BY varchar(50) not null,
	CHANGED_DT datetime,
	CHANGED_BY varchar(50)
	
	CONSTRAINT FK_USER_ROLE FOREIGN KEY (ROLE_ID) REFERENCES 
	amir.TB_M_ROLE(ID),
);

CREATE TABLE amir.TB_M_ROLE_PERMISSIONS (
	ID int IDENTITY(1,1) PRIMARY KEY,
	ROLE_ID int,
	[FUNCTION] varchar(50),
	FEATURE varchar(50),
	CREATED_DT datetime not null default(getdate()),
	CREATED_BY varchar(50) not null,
	CHANGED_DT datetime,
	CHANGED_BY varchar(50)
	
	CONSTRAINT FK_ROLE_PERMISSIONS FOREIGN KEY (ROLE_ID) REFERENCES 
	amir.TB_M_ROLE(ID)
);

-- SUPERADMIN ROLE
INSERT INTO amir.TB_M_ROLE (ROLE_NAME, CREATED_DT, CREATED_BY)
VALUES ('superadmin', GETDATE(), 'SYSTEM');
INSERT INTO amir.TB_M_ROLE_PERMISSIONS (
	ROLE_ID, [FUNCTION], FEATURE, CREATED_DT, CREATED_BY
)
VALUES (1, 'masterMaterial', 'createMaterial', GETDATE(), 'system')
INSERT INTO amir.TB_M_ROLE_PERMISSIONS (
	ROLE_ID, [FUNCTION], FEATURE, CREATED_DT, CREATED_BY
)
VALUES (1, 'masterMaterial', 'viewMaterial', GETDATE(), 'system')
INSERT INTO amir.TB_M_ROLE_PERMISSIONS (
	ROLE_ID, [FUNCTION], FEATURE, CREATED_DT, CREATED_BY
)
VALUES (1, 'masterMaterial', 'viewMaterialDetail', GETDATE(), 'system')
INSERT INTO amir.TB_M_ROLE_PERMISSIONS (
	ROLE_ID, [FUNCTION], FEATURE, CREATED_DT, CREATED_BY
)
VALUES (1, 'masterMaterial', 'updateMaterial', GETDATE(), 'system')
INSERT INTO amir.TB_M_ROLE_PERMISSIONS (
	ROLE_ID, [FUNCTION], FEATURE, CREATED_DT, CREATED_BY
)
VALUES (1, 'masterMaterial', 'deleteMaterial', GETDATE(), 'system')


INSERT INTO amir.TB_M_ROLE (ROLE_NAME, CREATED_DT, CREATED_BY)
VALUES ('staff', GETDATE(), 'SYSTEM');
INSERT INTO amir.TB_M_ROLE_PERMISSIONS (
	ROLE_ID, [FUNCTION], FEATURE, CREATED_DT, CREATED_BY
)
VALUES (2, 'masterMaterial', 'viewMaterial', GETDATE(), 'system')
INSERT INTO amir.TB_M_ROLE_PERMISSIONS (
	ROLE_ID, [FUNCTION], FEATURE, CREATED_DT, CREATED_BY
)
VALUES (2, 'masterMaterial', 'viewMaterialDetail', GETDATE(), 'system')

ALTER TABLE amir.TB_M_USER 
ALTER COLUMN PASSWORD varchar(255) not null;
