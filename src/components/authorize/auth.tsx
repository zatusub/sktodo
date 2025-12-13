import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface AuthProps {
    onLogin: (userId: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // 1. Try to insert (Sign up)
            // Generate UUID client-side because DB doesn't seem to auto-generate it
            const newUserId = self.crypto.randomUUID();
            
            // Remove .single() to avoid "Cannot coerce..." error if returns 0 or >1 rows (though insert should range 0-1)
            const { data: insertData, error: insertError } = await supabase
                .from('users')
                .insert([
                    { 
                        user_id: newUserId,
                        email, 
                        username, 
                        password_hash: 'NASI',
                        created_at: new Date().toISOString()
                    }
                ])
                .select();

            if (!insertError && insertData && insertData.length > 0) {
                console.log('User created:', insertData[0]);
                setMessage('登録成功！ログインします...');
                onLogin(insertData[0].user_id);
                return;
            }

            // 2. If insert failed (likely already exists), try to select (Sign in)
            console.log('Insert failed or returned no data (likely exists), trying to fetch user...', insertError);
            
            const { data: userData, error: selectError } = await supabase
                .from('users')
                .select('user_id, username')
                .eq('email', email)
                .maybeSingle(); // Use maybeSingle to prevent error if not found

            if (selectError) {
                throw selectError;
            }
            if (!userData) {
                throw new Error('ユーザーが見つかりませんでした。');
            }

            console.log('User found:', userData);
            setMessage('ログイン成功！');
            onLogin(userData.user_id);

        } catch (error: any) {
            console.error('Auth Error:', error);
            setMessage(`エラーが発生しました: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100vh', backgroundColor: '#1a1a1a', color: 'white'
        }}>
            <form onSubmit={handleLogin} style={{
                display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem',
                backgroundColor: '#333', borderRadius: '8px', minWidth: '300px'
            }}>
                <h2 style={{ textAlign: 'center', margin: 0 }}>Login / Register</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Email</label>
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#222', color: 'white' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Username</label>
                    <input 
                        type="text" 
                        required 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #555', backgroundColor: '#222', color: 'white' }}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                        padding: '0.75rem', marginTop: '1rem', borderRadius: '4px', border: 'none',
                        backgroundColor: loading ? '#555' : '#007bff', color: 'white', cursor: loading ? 'default' : 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {loading ? 'Processing...' : 'Start'}
                </button>

                {message && <p style={{ textAlign: 'center', fontSize: '0.9rem', color: message.includes('エラー') ? '#ff6b6b' : '#51cf66' }}>{message}</p>}
            </form>
        </div>
    );
};
