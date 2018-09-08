
$(function() {
    
    $('#create-user-account').click(()=> {
        $('form.login-form').hide();
        $('form.register-form').show();
    });
   
    $('#sign-in').click(()=> {
       $('form.login-form').show();
       $('form.register-form').hide();
   });
   
   $('.login-form').submit((e) => {
       e.preventDefault();
       const payload = {
           email: $('#login-email').val(),
           password: $('#login-password').val()
       };

       fetch('/customer/login', {method: 'POST', body: JSON.stringify(payload)})
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // login success rediect to menu listing page
                    fetch('list-menu.html').then(response => {console.log(response)
                    window.location='list-menu.html'});
                }
            });
   });

   $('.register-form').submit((e) => {
        e.preventDefault();
        const payload = {
            firstname: $('#register-firstname').val(),
            lastname: $('#register-lastname').val(),
            email: $('#register-email').val(),
            password: $('#register-password').val(),
            address: $('#register-address').val()
        };

        fetch('/customer/register', {method: 'POST', body: JSON.stringify(payload)})
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    $('form.login-form').show();
                    $('form.register-form').hide();
                }
            });
    });
});

