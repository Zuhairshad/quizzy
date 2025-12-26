export default function TestEnvPage() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
            <div className="space-y-2">
                <div>
                    <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>{' '}
                    {url ? (
                        <span className="text-green-600">✅ SET ({url.substring(0, 40)}...)</span>
                    ) : (
                        <span className="text-red-600">❌ MISSING</span>
                    )}
                </div>
                <div>
                    <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>{' '}
                    {key ? (
                        <span className="text-green-600">
                            ✅ SET (starts with: {key.substring(0, 20)}...)
                        </span>
                    ) : (
                        <span className="text-red-600">❌ MISSING</span>
                    )}
                </div>
                <div>
                    <strong>SUPABASE_SERVICE_ROLE_KEY:</strong>{' '}
                    {serviceKey ? (
                        <span className="text-green-600">
                            ✅ SET (starts with: {serviceKey.substring(0, 20)}...)
                        </span>
                    ) : (
                        <span className="text-red-600">❌ MISSING</span>
                    )}
                </div>
            </div>
            <div className="mt-6 p-4 bg-muted rounded">
                <p className="font-bold">If variables are missing:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Make sure .env.local is in the project root</li>
                    <li>Restart your dev server (Ctrl+C then npm run dev)</li>
                    <li>Check for typos in variable names</li>
                </ol>
            </div>
        </div>
    )
}


