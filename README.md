# Secrets
Secrets - Share your secrets anonymously

Tech stack used - HTML, CSS, Bootstrap, NodeJS, MonogDB, OAuth.

The idea behind this project is that a user can post secretly anonymously on website other user can see these secrets but they won't know who has posted the secret. The idea behind the website is to help people express themselves and let it out without the fear of revealing their identiy.

I have two types of register methods, one with a normal username and passsword and other with google account. For normal registration, I'm taking the username and password from the user and storing it in my MongoDB database in the backend. To provide my security the passwords are hashed, salted and then stored in the database this provides more security and privacy. The other type of login which I have implemented is using OAuth by google. The user can sign in with their google account and just their id is stored in the backend. So the login part is thoroughly secure and safe from any security breaches.
I have used nodejs for user authentication and routes handling. After logging in the user can submit a secret and the secret gets posted on a wall which can be seen by other users without knowing the identity of the actual person. So in this project I have used basic html,css,bootstrap for front end designing and nodejs and mongodb for backend functionality and data security.
