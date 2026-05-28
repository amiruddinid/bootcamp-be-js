const {generateToken} = require('../../utils/jwt');
const {hashPassword, comparePassword} = require('../../utils/bcrypt');
const {findUserByUsername, createUser, 
    findUserFeatureByUsername, findUserFunctionByUsername} = require('./auth.repository');

// Service untuk menangani logika bisnis terkait autentikasi, 
// seperti register, login, dll
const registerUser = async ({USERNAME, PASSWORD, NOREG, EMAIL, ROLE_ID}) => {
    try {
        // logic bisnis untuk cek apakah username sudah ada
        const user = await findUserByUsername(USERNAME);
        
        if (user.rows > 0) {
            return {status: 400, data: {message: 'Username already exists'}};
        }

        // Hash password (logic bisnis untuk mengamankan password)
        const hashedPassword = await hashPassword(PASSWORD);
        console.log(`Password asli: ${PASSWORD}, 
            Password hash: ${hashedPassword}`);

        // Simpan pengguna ke "database" (logic bisnis untuk menyimpan data pengguna)
        // {
        //     USERNAME: USERNAME,
        //     PASSWORD: 'hashedpassword123',
        //     NOREG: NOREG,
        //     EMAIL: EMAIL
        //     ROLE_ID: ROLE_ID
        // }
        const newUserResult = await createUser({
            USERNAME,
            PASSWORD: hashedPassword,
            NOREG,
            EMAIL,
            ROLE_ID
        });

        if(newUserResult.rows === 0) {
            return {status: 500, data: {message: 'Failed to register user'}};
        }

        return {
            status: 201,
            data: {
                USERNAME: newUserResult.USERNAME,
                NOREG: newUserResult.NOREG,
                EMAIL: newUserResult.EMAIL,
                ROLE_NAME: newUserResult.ROLE_NAME
            },
            message: 'User registered successfully'
        };
    } catch (err) {
        console.error('Error during registration:', err);
        return {status: 500, data: {message: 'Internal server error'}};
    }
}
    
// logic bisnis untuk login, cek username dan password, generate token, dll
const loginUser = async ({username, password}) => {
    try{
        // Cari pengguna berdasarkan username
        const user = await findUserByUsername(username);
        if (!user || user.rows === 0) {
            return {status: 400, data: {message: 'Please check your username and password'}};
        }

        // Cek password
        const isPasswordValid = await comparePassword(password, user.PASSWORD);
        if (!isPasswordValid) {
            return {status: 400, data: {message: 'Please check your username and password'}};
        }

        // Generate token
        const token = generateToken({USERNAME: user.USERNAME});
        return {
            status: 200,
            data:{
                username: user.USERNAME,
                email: user.EMAIL,
                role: user.ROLE_NAME,
                noreg: user.NOREG,
                token
            },
            message: 'Login successful'
        };
    } catch (err) {
        console.error('Error during login:', err);
        return {status: 500, data: {message: 'Internal server error'}};
    }
}

const getProfile = async (username) => {
    try {
        const user = await findUserByUsername(username);
        if (!user) {
            return {status: 404, data: {message: 'User not found'}};
        }
        const userFeature = await findUserFeatureByUsername(username);
        const userFunction = await findUserFunctionByUsername(username);
        return {
            data: {
                username: user.USERNAME,
                email: user.EMAIL,
                roleId: user.ROLE_ID,
                role: user.ROLE_NAME,
                noreg: user.NOREG,
                features: userFeature,
                functions: userFunction,
            }
        };
    } catch (err) {
        throw err;
     }
}

module.exports = {
    registerUser,
    loginUser,
    getProfile
}