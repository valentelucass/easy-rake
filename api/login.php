<?php
session_start();
include 'db_connection.php'; 

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

$data = json_decode(file_get_contents('php://input'), true);

// Leitura segura dos dados enviados pelo JavaScript
$email_ou_username = $data['email'] ?? null;
$password = $data['password'] ?? null;
$codigo_acesso = $data['codigo_acesso'] ?? null;

if (empty($email_ou_username) || empty($password)) {
    exit(json_encode(['success' => false, 'message' => 'E-mail/Usuário e senha são obrigatórios.']));
}

// --- FLUXO 1: LOGIN DO GESTOR ou CAIXA (sem código de acesso) ---
if (empty($codigo_acesso)) {
    // Tenta primeiro como Gestor (na tabela unidades)
    $stmt_gestor = $conn->prepare("SELECT id, nome_unidade, email_gestor, senha_gestor, codigo_acesso FROM unidades WHERE email_gestor = ?");
    $stmt_gestor->execute([$email_ou_username]);
    $gestor = $stmt_gestor->fetch(PDO::FETCH_ASSOC);

    if ($gestor && password_verify($password, $gestor['senha_gestor'])) {
        // Sucesso como Gestor
        $_SESSION['user_id'] = 'gestor_' . $gestor['id'];
        $_SESSION['unidade_id'] = $gestor['id'];
        $_SESSION['perfil'] = 'gestor';
        $_SESSION['nome'] = $gestor['nome_unidade'];
        $_SESSION['codigo_acesso'] = $gestor['codigo_acesso'];
        exit(json_encode(['success' => true, 'perfil' => 'gestor']));
    }

    // Se não for Gestor, tenta como Caixa (na tabela usuarios)
    $stmt_caixa = $conn->prepare("SELECT u.id, u.username, u.password, un.id as unidade_id, un.codigo_acesso
                                  FROM usuarios u
                                  JOIN unidades un ON u.unidade_id = un.id
                                  WHERE u.username = ? AND u.profile = 'caixa' AND u.status = 'aprovado'");
    $stmt_caixa->execute([$email_ou_username]);
    $caixa = $stmt_caixa->fetch(PDO::FETCH_ASSOC);
    
    if ($caixa && password_verify($password, $caixa['password'])) {
        // Sucesso como Caixa
        $_SESSION['user_id'] = $caixa['id'];
        $_SESSION['unidade_id'] = $caixa['unidade_id'];
        $_SESSION['perfil'] = 'caixa';
        $_SESSION['nome'] = $caixa['username'];
        $_SESSION['codigo_acesso'] = $caixa['codigo_acesso'];
        exit(json_encode(['success' => true, 'perfil' => 'caixa']));
    }
    
    // Se não encontrou nem Gestor nem Caixa
    exit(json_encode(['success' => false, 'message' => 'Credenciais inválidas.']));
}
// --- FLUXO 2: LOGIN DO SANGER (com código de acesso) ---
else {
    $stmt_sanger = $conn->prepare(
        "SELECT u.id, u.username, u.password, u.status, un.id as unidade_id, un.codigo_acesso
         FROM usuarios u
         JOIN unidades un ON u.unidade_id = un.id
         WHERE u.username = ? AND un.codigo_acesso = ? AND u.profile = 'sanger'"
    );
    $stmt_sanger->execute([$email_ou_username, $codigo_acesso]);
    $sanger = $stmt_sanger->fetch(PDO::FETCH_ASSOC);

    if (!$sanger) {
        exit(json_encode(['success' => false, 'message' => 'Usuário ou Código de Acesso não encontrado para o perfil Sanger.']));
    }
    if ($sanger['status'] !== 'aprovado') {
        exit(json_encode(['success' => false, 'message' => 'Seu acesso ainda não foi aprovado pelo gestor.']));
    }
    if (password_verify($password, $sanger['password'])) {
        // Sucesso como Sanger
        $_SESSION['user_id'] = $sanger['id'];
        $_SESSION['unidade_id'] = $sanger['unidade_id'];
        $_SESSION['perfil'] = 'sanger';
        $_SESSION['nome'] = $sanger['username'];
        $_SESSION['codigo_acesso'] = $sanger['codigo_acesso'];
        exit(json_encode(['success' => true, 'perfil' => 'sanger']));
    } else {
        exit(json_encode(['success' => false, 'message' => 'Senha inválida para este usuário.']));
    }
}
?>