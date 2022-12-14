const express = require("express")
const route = express.Router();
var jwt = require('jsonwebtoken');
const dotenv  = require("dotenv");
dotenv.config();

const User = require("../model/User.model")
const Score = require("../model/Scores.model");
const Leaderboard = require("../model/Leaderboard.model");

route.get("/:id", async(req, res)=>{
    try{
        const data = await Score.find({user:req.params.id}).sort({updatedAt:-1})
    return res.send(data)
    }
    catch(err)
    {
        return res.send(err)
    }
})

route.post("/", async(req, res)=>{
    try{
                const bestScore = await Leaderboard.findOne({user:req.body.user}).populate("bestScore");
                const resp = await Score.create(req.body)

                if(!bestScore)
                {
                    const insertedRecord = await Leaderboard.create({user:req.body.user, bestScore:resp._id})
                    return res.status(200).send({data:insertedRecord, error:false, message:"inserted leaderboard"});
                }
                else if(bestScore.bestScore.netSpeed < req.body.netSpeed)
                {
                    const updatedRecord = await Leaderboard.findOneAndUpdate({user:req.body.user}, {bestScore:resp._id}, {new:true})
                    return res.status(200).send({data:updatedRecord, error:false, message:"updated leaderboard"});
                }
                else
                {   
                    return res.status(200).send({data:resp, error:false, message:"inserted score"});
                }
      }catch(err){
        return res.status(400).send({error:true,message:err.message})
      }
})

route.get("/:token", async (req, res)=>{
    try{
        var decoded = jwt.verify(req.params.token, process.env.SECRET_KEY);
        var scores = await Score.find({user:decoded.id})
        return res.status(200).send({error:false, data:scores})
    }
    catch(e)
    {
        return res.status(400).send({error:true, message:e.message});
    }
})

module.exports = route;