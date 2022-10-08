const pool = require("../db.js");

const PostThread = async (req,res) =>{
    try{
        const user = req.user;
        const userId = user.id;
        
        const content = req.body.content;
        const isAnonymous = req.body.isAnonymous;

        if(!userId){
            throw Error ("Missing user id");
        }
        if(!content){
            throw Error ("No content");
        }
        if(!isAnonymous){
            throw Error ("isAnonymous is missing");
        }

        const queryThread = await pool.query(
            "INSERT INTO Threads(user_id, content, is_anonymous) VALUES($1,$2,$3) RETURNING *",
            [userId, content, isAnonymous]
        );

        if(!queryThread) {
            throw Error ("Fail to insert to database!");
        }
        return res.status(200).json({
            message: "success",
            data: {
            email : user.email,
            content: content,
            isAnonymous: isAnonymous
            },
            error: false,
        });

    } catch(error){
        return res.status(400).json({
            message: error.message,
            data: [],
            error: true,
        });
    }
}

const GetThread = async(req,res) => {
    try{
        const batch = req.query.batch;
        const limit = req.query.limit;
        
        if(!batch) {
            throw Error ("parameter batch missing");
        }
        if(!limit) {
            throw Error ("parameter limit missing");
        }

        const threads = await pool.query(
            "SELECT * FROM Threads ORDER BY thread_id DESC LIMIT ($1) OFFSET ($2)",
            [limit, (batch-1)*limit]
        );

        return res.status(200).json({
            message: "success",
            data: threads.rows,
            error: false,
        });

    } catch(error){
        return res.status(400).json({
            message: error.message,
            data: [],
            error: true,
        });
    }
}   

const GetThreadByUser = async (req,res) => {
    try{
        const user = req.user;   
        const userId = user.id;
        
        if(!userId){
            throw Error ("missing user id");
        }

        const threads = await pool.query(
            "SELECT * FROM Threads WHERE user_id = ($1)",
            [userId]
        );

        return res.status(200).json({
            message: "success",
            data: threads.rows,
            error: false,
        });

    }catch(error){
        return res.status(400).json({
            message: error.message,
            data: [],
            error: true,
        });
    }

}

const threadService = {
    PostThread,
    GetThreadByUser,
    GetThread
};

module.exports = threadService;