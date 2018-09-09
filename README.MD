## The task

Use native Nodejs without any 3rd party lib to create RESTFul APIs for pizza delivery company . The API supports user registration, a registered user can log in/off, a logged in user can view a list of pizza menu, can place orders, check out orders, and after checkout, user will get charged accordingly and email with payment receipt.

### Get the source code

in terminal and do the following:

```
$git clone https://github.com/yangarnet/node-pizza-server.git
$node app.js
```

### Prerequisites

To test email, will need to setup a pair of API keys and other request options for email provider. go and check the file _setting.json_
the format looks like the following:

```
    "MAILGUN_API_PATH": "",
    "MAILGUN_AUTH": "",
    "MAINGUN_SANBOX": ""
```

### API usage

A postman collection is added as the following, just download and import into postman, start playing with the API

```
    postman_collection.json
```

To test the API in postman in local host as the following, will need a valid token by logging in

-   user registration:

```
    @path: /customer/register
    @headers: content-type: application/json
    @method: POST,
    @payload:
    {
        "firstname":"firstname",
        "lastname":"last name",
        "email":"your_email@gmail.com",
        "password":"passw0rd",
        "address":"100 main st"
    }
```

-   user login

```
    @path: /customer/login
    @method: POST
    @headers: Content-Type:application/json
    @payload:{ "password":"passw0rd", "email":"your_email@gmail.com"}
```

-   user log off

```
    @path: /customer/logoff
    @method: POST
    @headers: {tokenId:'gJG9JVgGV7fGUJJTHTg2'}
```

-   user update

```
    @description: update user address or password
    @path: /customer/update
    @method: PUT
    @headers: {token:'gJG9JVgGV7fGUJJTHTg2', 'Content-Type':'application/json'}
    @payload: { "email":"your_email@gmail.com", "password":"passw0rd", "address":"102 william st"}
```

-   user delete account

```
    @path: /customer/cancel
    @method: DELETE
    @headers: {token: 'd9HH7HUV7dNUJaJYTHHK', Content-Type:application/json}
    @payload: {"email":"your_email@gmail.com"}
```

-   list menu for logged in user

```
    @path: /customer/listmenu
    @method: GET
    @headers: {token:'gJG9JVgGV7fGUJJTHTg2', email:'your_email@gmail.com'}
```

-   add new order

```
    @path /customer/shopping/add
    @method: POST
    @content-type: application/json
    @header: { token: 'gJG9JVgGV7fGUJJTHTg2', email:'your_email@gmail.com',Content-Type:application/json }
    @payload:
    {
        "pizza":"this is my 2nd order of pizza",
        "number":"8",
        "unitprice":"90"
    }
```

-   check out

```
    @path /customer/shopping/checkout
    @method POST
    @header {token:'gJG9JVgGV7fGUJJTHTg2', email:'your_email@gmail.com'}
```
