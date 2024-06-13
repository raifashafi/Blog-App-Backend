const express=require("express")
const mongoose=require("mongoose")
const cors=require("cors")
const bcrypt=require( "bcryptjs")
const jwt=require("jsonwebtoken")
const {usermodel}=require("./models/blog")



const app=express()
app.use(cors())
app.use(express.json())
mongoose.connect("mongodb+srv://raifashafi:raifashafi@cluster0.tznb7.mongodb.net/blogDB?retryWrites=true&w=majority&appName=Cluster0")
    

const generateHashedPassword=async(password)=>{
const salt = await bcrypt.genSalt(10)
return bcrypt.hash(password,salt)
    
}

app.post("/signUp",async (req,res)=>{
    let input=req.body
    let hashedPassword=await generateHashedPassword(input.password)
    console.log(hashedPassword)
    input.password = hashedPassword  
    let blog= new usermodel(input)
    blog.save()
    res.json({"status":"success"})
})
app.post("/signIn",(req,res)=>{


    let input=req.body

    usermodel.find({"email":req.body.email}).then(
        (response)=>{
        if (response.length>0) {
            let dbPassword=response[0].password
            console.log(dbPassword)
            bcrypt.compare(input.password,dbPassword,(error,isMatch)=>{
                if (isMatch) {
                   jwt.sign({email:input.email},"blog-app",{expiresIn:"1d"},(error,token)=>{
                    if (error) {
                        res.json({"status":"unable to create token"})
                    } else {
                        res.json({"status":"success","userId":response[0]._id,"token":token})
                    }
                   })
                } else {
                    res.json({"status":"incorrect password"})
                }
            })
        } else {
            res.json({"status":"user not found"})
        }
        }
    ).catch()

})
app.post("/viewUsers",(req,res)=>{
    let token=req.headers["token"]
    jwt.verify(token,"blog-app",(
        (error,decoded)=>{
            if (error) {
                res.json({"status":"unauthorized access"})
            } else {
                if (decoded) {
                    usermodel.find().then(
                        (response)=>{
                            res.json(response)
                        }
                    ).catch() 
                } 
            }
        }
    ))
})
app.listen(8081,()=>{
    console.log("server started")
})