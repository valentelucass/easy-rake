<?php
// Garante que o script comece exatamente aqui, sem espaços ou linhas antes.

// 1. Inicia a sessão para poder manipulá-la.
session_start();

// 2. Limpa todas as variáveis da sessão.
session_unset();

// 3. Destrói a sessão por completo.
session_destroy();

// 4. Redireciona o usuário para a página de login.
//    O comando exit() garante que nenhum outro código seja executado após o redirecionamento.
header('Location: login.php');
exit();

// É uma boa prática em PHP não fechar a tag "" 
//em arquivos que só contêm código PHP.
// Isso previne que espaços ou linhas em branco acidentais após o fechamento sejam enviados ao navegador.

?>