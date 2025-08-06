import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true,
    }
});

const User = mongoose.model("User", userSchema);

export default User;


// Embedding version
// here we do not need to create the 'Address' entity as a seperate. and we embedding the 'Address'(object) properties in same 'User' entity

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     firstName: {
//         type: String,
//         required: true,
//     },
//     lastName: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//         required: true,
//     },
//     address: {
//         type: Object,
//         required: true,
//         properties: {
//             street: {
//                 type: String,
//                 required: true,
//             },
//             city: {
//                 type: String,
//                 required: true,
//             },
//             state: {
//                 type: String,
//                 required: true,
//             },
//             zipCode: {
//                 type: String,
//                 required: true,
//             },
//         },
//     }
// });

// const User = mongoose.model("User", userSchema);

// export default User;

//----------------------------------------------------------

// Parent Referencing version
// here we need to create the 'Address' entity as the parent and mention the address objectId in User table as foreign key (parent reference)

// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema({
//     firstName: {
//         type: String,
//         required: true,
//     },
//     lastName: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//         required: true,
//     },
//     addressId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Address",
//         required: true,
//     }
// });

// const User = mongoose.model("User", userSchema);

// export default User;