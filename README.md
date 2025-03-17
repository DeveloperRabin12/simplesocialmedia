# social-media type

This is a simple web application built with Node.js, Express, MongoDB, and EJS. The application allows users to register, log in, create posts, and view their profile.

## Project Structure

```

.gitignore
app.js
package.json
models/
    post.js
    user.js
views/
    index.ejs
    login.ejs
    profile.ejs
```

## Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```sh
    cd part16
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```

## Usage

1. Start the server:
    ```sh
    node app.js
    ```
2. Open your browser and navigate to `http://localhost:3000`.

## Routes

- `/` - Home route
- `/register` - Registration page
- `/login` - Login page
- `/profile` - Profile page (requires login)
- `/logout` - Logout route

## Models

### User Model

Defined in [models/user.js](models/user.js):
```js
const userSchema = mongoose.Schema({
    username: String,
    name: String,
    age: Number,
    email: String,
    password: String,
    posts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }]
});
```

### Post Model

Defined in [models/post.js](models/post.js):
```js
const postSchema = mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    date:{
        type:Date,
        default:Date.now
    },
    content: String,
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }]
});
```

## Views

- `views/index.ejs` - Registration page
- `views/login.ejs` - Login page
- `views/profile.ejs` - Profile page

## Dependencies

- bcrypt: ^5.1.1
- cookie-parser: ^1.4.7
- ejs: ^3.1.10
- express: ^4.21.2
- jsonwebtoken: ^9.0.2
- mongoose: ^8.12.1

## License

This project is licensed under the ISC License.
