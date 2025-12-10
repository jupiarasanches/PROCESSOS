Write-Host "Iniciando deploy das funções do Supabase..."
Write-Host "Passo 1: Login (Se abrir o navegador, autorize o acesso)"
npx supabase login
Write-Host "Passo 2: Deploy da função accept-invite"
npx supabase functions deploy accept-invite --project-ref ssdzalxixubdotkebeyx --no-verify-jwt
Write-Host "Deploy concluído! Tente aceitar o convite novamente."
Pause
