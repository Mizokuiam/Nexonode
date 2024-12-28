// Example code for pair programming demo
class UserService {
    // AI suggests method implementation
    async createUser(userData) {
        // Validate user data
        if (!userData.email || !userData.password) {
            throw new Error('Email and password are required');
        }

        // AI suggests password hashing
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // AI suggests creating user object
        const user = new User({
            ...userData,
            password: hashedPassword,
            createdAt: new Date()
        });

        // AI suggests error handling
        try {
            await user.save();
            return user;
        } catch (error) {
            throw new Error('Failed to create user');
        }
    }
}
