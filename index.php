<?php
// === index.php (VERSÃO FINAL E CORRETA) ===
session_start();

// Se o usuário já tem uma sessão ativa, manda ele direto para o dashboard.
if (isset($_SESSION['user_id'])) {
    header('Location: dashboard.php');
    exit();
} else {
    // Se não tem sessão, manda para a página de login.
    header('Location: login.php');
    exit();
}
// NÃO DEVE HAVER NENHUM CÓDIGO HTML ABAIXO DESTA LINHA
?>