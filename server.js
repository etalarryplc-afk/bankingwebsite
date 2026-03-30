const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./usfinance.db', (err) => {
    if (err) console.error('Database error:', err.message);
    else console.log('Connected to SQLite database');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        is_admin INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        account_type TEXT NOT NULL,
        account_number TEXT UNIQUE NOT NULL,
        balance REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        id_number TEXT,
        id_front TEXT,
        id_back TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        account_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        recipient_account TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (account_id) REFERENCES accounts(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS admin_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        target_type TEXT,
        target_id INTEGER,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(id)
    )`);

    // Create admin user
    const adminEmail = 'admin@usfinance.com';
    db.get("SELECT id FROM users WHERE email = ?", [adminEmail], (err, row) => {
        if (!row) {
            const hashedPassword = bcrypt.hashSync('admin', 10);
            db.run(`INSERT INTO users (email, password, first_name, last_name, is_admin) VALUES (?, ?, ?, ?, ?)`,
                [adminEmail, hashedPassword, 'System', 'Administrator', 1]);
            console.log('✓ Admin user created: admin@usfinance.com / admin');
        }
    });
});

function generateAccountNumber() {
    return 'USF' + Math.floor(100000000 + Math.random() * 900000000);
}

function generateToken() {
    return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2);
}

// Helper function to verify admin
function verifyAdmin(token, callback) {
    db.get(`SELECT u.* FROM users u 
            JOIN sessions s ON u.id = s.user_id 
            WHERE s.token = ? AND s.expires_at > datetime('now')`, 
        [token], (err, user) => {
            if (err || !user || !user.is_admin) {
                callback(null);
            } else {
                callback(user);
            }
        });
}

// Helper function to verify user
function verifyUser(token, callback) {
    db.get(`SELECT u.* FROM users u 
            JOIN sessions s ON u.id = s.user_id 
            WHERE s.token = ? AND s.expires_at > datetime('now')`, 
        [token], (err, user) => {
            if (err || !user) {
                callback(null);
            } else {
                callback(user);
            }
        });
}

// ============ AUTH ROUTES ============

app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    
    db.get("SELECT id FROM users WHERE email = ?", [email], (err, row) => {
        if (row) {
            return res.status(400).json({ success: false, message: 'Email already registered' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        
        db.run(`INSERT INTO users (email, password) VALUES (?, ?)`, 
            [email, hashedPassword], 
            function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Registration failed' });
                }
                res.json({ success: true, userId: this.lastID, message: 'Registration successful' });
            }
        );
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        
        db.run(`INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)`,
            [user.id, token, expiresAt]);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                isAdmin: user.is_admin === 1
            }
        });
    });
});

app.post('/api/logout', (req, res) => {
    const { token } = req.body;
    if (token) {
        db.run("DELETE FROM sessions WHERE token = ?", [token]);
    }
    res.json({ success: true });
});

app.get('/api/session/:token', (req, res) => {
    const { token } = req.params;
    
    db.get(`SELECT u.* FROM users u 
            JOIN sessions s ON u.id = s.user_id 
            WHERE s.token = ? AND s.expires_at > datetime('now')`, 
        [token], (err, user) => {
            if (err || !user) {
                return res.status(401).json({ valid: false });
            }
            res.json({
                valid: true,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    isAdmin: user.is_admin === 1
                }
            });
        });
});

// ============ ACCOUNT ROUTES ============

app.post('/api/accounts', (req, res) => {
    const { token } = req.headers;
    const { accountType, firstName, lastName, idNumber, phoneNumber, zipCode, city } = req.body;
    
    verifyUser(token, (user) => {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const accountNumber = generateAccountNumber();
        
        db.run(`INSERT INTO accounts (user_id, account_type, account_number, id_number, status, balance) VALUES (?, ?, ?, ?, ?, ?)`,
            [user.id, accountType, accountNumber, idNumber, 'pending', 0],
            function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Account creation failed' });
                }
                
                db.run(`UPDATE users SET first_name = ?, last_name = ?, phone = ?, city = ?, zip_code = ?, updated_at = datetime('now') WHERE id = ?`,
                    [firstName, lastName, phoneNumber, city, zipCode, user.id]);
                
                res.json({ success: true, accountId: this.lastID, accountNumber, message: 'Account application submitted' });
            }
        );
    });
});

app.get('/api/accounts', (req, res) => {
    const { token } = req.headers;
    
    verifyUser(token, (user) => {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        db.all(`SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at DESC`, 
            [user.id], (err, accounts) => {
                res.json({ success: true, accounts });
            });
    });
});

// ============ TRANSACTION ROUTES ============

app.post('/api/transactions', (req, res) => {
    const { token } = req.headers;
    const { accountId, type, amount, description, recipientAccount, recipientRouting, recipientBank } = req.body;
    
    verifyUser(token, (user) => {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (type !== 'deposit' && type !== 'transfer_in') {
            db.get(`SELECT balance FROM accounts WHERE id = ? AND user_id = ?`, 
                [accountId, user.id], (err, account) => {
                    if (!account || account.balance < amount) {
                        return res.status(400).json({ success: false, message: 'Insufficient funds' });
                    }
                });
        }

        const txnType = type === 'transfer' ? 'transfer_out' : type;
        let recipientInfo = recipientAccount;
        if (recipientRouting || recipientBank) {
            const parts = [];
            if (recipientBank) parts.push(recipientBank);
            if (recipientRouting) parts.push(`RT: ${recipientRouting}`);
            recipientInfo = `${recipientAccount} (${parts.join(', ')})`;
        }
        
        db.run(`INSERT INTO transactions (user_id, account_id, type, amount, description, recipient_account, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [user.id, accountId, txnType, amount, description, recipientInfo],
            function(err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Transaction failed' });
                }
                res.json({ success: true, transactionId: this.lastID, message: 'Transaction submitted' });
            }
        );
    });
});

app.get('/api/transactions', (req, res) => {
    const { token } = req.headers;
    
    verifyUser(token, (user) => {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        db.all(`SELECT t.*, a.account_number FROM transactions t JOIN accounts a ON t.account_id = a.id WHERE t.user_id = ? ORDER BY t.created_at DESC`, 
            [user.id], (err, transactions) => {
                res.json({ success: true, transactions });
            });
    });
});

// ============ ADMIN ROUTES ============

app.get('/api/admin/accounts/pending', (req, res) => {
    const { token } = req.headers;
    
    verifyAdmin(token, (user) => {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Admin access required' });
        }

        db.all(`SELECT a.*, u.email as user_email, u.first_name, u.last_name 
                FROM accounts a 
                JOIN users u ON a.user_id = u.id 
                WHERE a.status = 'pending' 
                ORDER BY a.created_at DESC`, 
            (err, accounts) => {
                res.json({ success: true, accounts });
            });
    });
});

app.post('/api/admin/accounts/:id/approve', (req, res) => {
    const { token } = req.headers;
    const { id } = req.params;
    
    verifyAdmin(token, (user) => {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Admin access required' });
        }

        db.run(`UPDATE accounts SET status = 'approved', updated_at = datetime('now') WHERE id = ?`, [id], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to approve account' });
            }
            db.run(`INSERT INTO admin_logs (admin_id, action, target_type, target_id) VALUES (?, 'approve', 'account', ?)`,
                [user.id, id]);
            res.json({ success: true, message: 'Account approved' });
        });
    });
});

app.post('/api/admin/accounts/:id/reject', (req, res) => {
    const { token } = req.headers;
    const { id } = req.params;
    
    verifyAdmin(token, (user) => {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Admin access required' });
        }

        db.run(`UPDATE accounts SET status = 'rejected', updated_at = datetime('now') WHERE id = ?`, [id], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to reject account' });
            }
            db.run(`INSERT INTO admin_logs (admin_id, action, target_type, target_id) VALUES (?, 'reject', 'account', ?)`,
                [user.id, id]);
            res.json({ success: true, message: 'Account rejected' });
        });
    });
});

app.get('/api/admin/transactions', (req, res) => {
    const { token } = req.headers;
    
    verifyAdmin(token, (user) => {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Admin access required' });
        }

        db.all(`SELECT t.*, a.account_number, u.email as user_email, u.first_name, u.last_name 
                FROM transactions t 
                JOIN accounts a ON t.account_id = a.id 
                JOIN users u ON t.user_id = u.id 
                ORDER BY t.created_at DESC`, 
            (err, transactions) => {
                res.json({ success: true, transactions });
            });
    });
});

app.post('/api/admin/transactions/:id/approve', (req, res) => {
    const { token } = req.headers;
    const { id } = req.params;
    
    verifyAdmin(token, (user) => {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Admin access required' });
        }

        db.get(`SELECT * FROM transactions WHERE id = ?`, [id], (err, txn) => {
            if (!txn) {
                return res.status(404).json({ success: false, message: 'Transaction not found' });
            }

            db.get(`SELECT * FROM accounts WHERE id = ?`, [txn.account_id], (err, account) => {
                let newBalance = account.balance;
                if (txn.type === 'deposit' || txn.type === 'transfer_in') {
                    newBalance += txn.amount;
                } else {
                    newBalance -= txn.amount;
                }

                db.run(`UPDATE accounts SET balance = ?, updated_at = datetime('now') WHERE id = ?`,
                    [newBalance, txn.account_id], (err) => {
                        db.run(`UPDATE transactions SET status = 'approved' WHERE id = ?`, [id], (err) => {
                            db.run(`INSERT INTO admin_logs (admin_id, action, target_type, target_id) VALUES (?, 'approve', 'transaction', ?)`,
                                [user.id, id]);
                            res.json({ success: true, message: 'Transaction approved' });
                        });
                    });
            });
        });
    });
});

app.post('/api/admin/transactions/:id/reject', (req, res) => {
    const { token } = req.headers;
    const { id } = req.params;
    
    verifyAdmin(token, (user) => {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Admin access required' });
        }

        db.run(`UPDATE transactions SET status = 'rejected' WHERE id = ?`, [id], function(err) {
            if (err) {
                return res.status(500).json({ success: false, message: 'Failed to reject transaction' });
            }
            db.run(`INSERT INTO admin_logs (admin_id, action, target_type, target_id) VALUES (?, 'reject', 'transaction', ?)`,
                [user.id, id]);
            res.json({ success: true, message: 'Transaction rejected' });
        });
    });
});

app.get('/api/admin/users', (req, res) => {
    const { token } = req.headers;
    
    verifyAdmin(token, (user) => {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Admin access required' });
        }

        db.all(`SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.created_at,
                (SELECT COUNT(*) FROM accounts WHERE user_id = u.id) as total_accounts,
                (SELECT COUNT(*) FROM accounts WHERE user_id = u.id AND status = 'approved') as active_accounts,
                (SELECT COUNT(*) FROM accounts WHERE user_id = u.id AND status = 'pending') as pending_accounts
                FROM users u WHERE u.is_admin = 0`, 
            (err, users) => {
                res.json({ success: true, users });
            });
    });
});

app.get('/api/admin/stats', (req, res) => {
    const { token } = req.headers;
    
    verifyAdmin(token, (user) => {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Admin access required' });
        }

        db.get(`SELECT 
                (SELECT COUNT(*) FROM users WHERE is_admin = 0) as total_users,
                (SELECT COUNT(*) FROM accounts) as total_accounts,
                (SELECT COUNT(*) FROM accounts WHERE status = 'pending') as pending_accounts,
                (SELECT COALESCE(SUM(balance), 0) FROM accounts) as total_balance,
                (SELECT COUNT(*) FROM transactions WHERE status = 'pending') as pending_transactions`, 
            (err, stats) => {
                res.json({ success: true, stats });
            });
    });
});

// Admin deposit money to user account
app.post('/api/admin/deposit', (req, res) => {
    const { token } = req.headers;
    const { accountId, amount, description } = req.body;
    
    verifyAdmin(token, (user) => {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Admin access required' });
        }

        if (!accountId || !amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid account or amount' });
        }

        db.get(`SELECT * FROM accounts WHERE id = ?`, [accountId], (err, account) => {
            if (!account) {
                return res.status(404).json({ success: false, message: 'Account not found' });
            }

            const newBalance = account.balance + parseFloat(amount);
            
            db.run(`UPDATE accounts SET balance = ?, updated_at = datetime('now') WHERE id = ?`,
                [newBalance, accountId], (err) => {
                    // Create transaction record
                    db.run(`INSERT INTO transactions (user_id, account_id, type, amount, description, status) VALUES (?, ?, ?, ?, ?, 'approved')`,
                        [account.user_id, accountId, 'admin_deposit', amount, description || 'Admin deposit'],
                        (err) => {
                            db.run(`INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, 'deposit', 'account', ?, ?)`,
                                [user.id, accountId, `Deposited $${amount} - ${description || 'Admin deposit'}`]);
                            res.json({ success: true, message: `Successfully deposited $${amount} to account ${account.account_number}`, newBalance });
                        });
                });
        });
    });
});

// Get all accounts (for admin to manage)
app.get('/api/admin/accounts/all', (req, res) => {
    const { token } = req.headers;
    
    verifyAdmin(token, (user) => {
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized - Admin access required' });
        }

        db.all(`SELECT a.*, u.email as user_email, u.first_name, u.last_name 
                FROM accounts a 
                JOIN users u ON a.user_id = u.id 
                ORDER BY a.created_at DESC`, 
            (err, accounts) => {
                res.json({ success: true, accounts });
            });
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🏦 USFinance Server running on http://localhost:${PORT}`);
    console.log(`   Admin: admin@usfinance.com / admin\n`);
});
