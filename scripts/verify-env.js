// Script to verify environment variables
require('dotenv').config({ path: '.env.local' })

const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
}

console.log('🔍 Checking environment variables...\n')

let allValid = true

for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
        console.log(`❌ ${key}: MISSING`)
        allValid = false
    } else if (value.includes('your-') || value.includes('xxxxx') || value === 'your-project-url') {
        console.log(`❌ ${key}: Contains placeholder value`)
        allValid = false
    } else {
        // Check format
        if (key === 'NEXT_PUBLIC_SUPABASE_URL') {
            if (!value.startsWith('https://') || !value.includes('.supabase.co')) {
                console.log(`⚠️  ${key}: URL format looks incorrect`)
                console.log(`   Value: ${value.substring(0, 50)}...`)
            } else {
                console.log(`✅ ${key}: OK`)
                console.log(`   Value: ${value}`)
            }
        } else if (key.includes('ANON_KEY')) {
            if (!value.startsWith('eyJ')) {
                console.log(`⚠️  ${key}: Format looks incorrect (should start with 'eyJ')`)
                console.log(`   Value starts with: ${value.substring(0, 20)}...`)
            } else {
                console.log(`✅ ${key}: OK`)
                console.log(`   Value starts with: ${value.substring(0, 20)}...`)
            }
        } else if (key.includes('SERVICE_ROLE_KEY')) {
            if (!value.startsWith('eyJ')) {
                console.log(`⚠️  ${key}: Format looks incorrect (should start with 'eyJ')`)
                console.log(`   Value starts with: ${value.substring(0, 20)}...`)
            } else {
                console.log(`✅ ${key}: OK`)
                console.log(`   Value starts with: ${value.substring(0, 20)}...`)
            }
        }
    }
}

if (!allValid) {
    console.log('\n❌ Some environment variables are missing or invalid!')
    console.log('\n📝 To fix:')
    console.log('1. Go to your Supabase project: https://app.supabase.com')
    console.log('2. Go to Settings → API')
    console.log('3. Copy the correct values:')
    console.log('   - Project URL → NEXT_PUBLIC_SUPABASE_URL')
    console.log('   - anon/public key → NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.log('   - service_role key → SUPABASE_SERVICE_ROLE_KEY')
    console.log('4. Update your .env.local file')
    process.exit(1)
} else {
    console.log('\n✅ All environment variables are set correctly!')
}


