import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import loanRoutes from './routes/loans.js';
import transactionRoutes from './routes/transactions.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import connectDB from './config/database.js';

import adminSystemRoutes from './routes/adminSystem.js';
import generalSettingsRoutes from './routes/generalSettings.js';
// import adminSettingsRoutes from './routes/adminSettings.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/admin/system', adminSystemRoutes);
app.use('/api/admin/general-settings', generalSettingsRoutes)
// app.use('/api/admin/settings', adminSettingsRoutes);

// MongoDB connection
connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is runing at port: ${process.env.PORT}`);
    });
});
    
