require("dotenv").config();

const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");

app.use(cors());
app.use(express.json());

const TWITTER_BEARER_TOKEN = `Bearer ${process.env.BEARER_TOKEN_X}`;




app.get("/tweets/:username", async (req, res) => {
    try {
        const { username } = req.params;
        const response = await axios.get(
            `https://api.twitter.com/2/tweets/search/recent?query=from:${username}`,
            { headers: { Authorization: TWITTER_BEARER_TOKEN } }
        );
        res.json(response.data);
    } 
    
    catch (err) {
        res.status(500).json({ error: "Failed to get tweets" });
    }
});





app.post("/mcp", async (req, res) => {  
    try {
        console.log("Received MCP request:", req.body);  

        const { mcp_version, request_id, action, parameters } = req.body;

        if (mcp_version !== "1.0") {
            return res.status(400).json({
                error: "unsupported MCP version",
                expected: "1.0",
                received: mcp_version, 
            });
        }

        if (!action) {
            return res.status(400).json({ error: "missing ACTION" });
        }

        if (action === "get_tweets") {
            const username = parameters?.username;
            if (!username) {
                return res.status(400).json({ error: "Missing Username" });  
            }

            const response = await axios.get(
                `https://api.twitter.com/2/tweets/search/recent?query=from:${username}`,
                { headers: { Authorization: TWITTER_BEARER_TOKEN } }
            );

            return res.json({
                mcp_version: "1.0",
                request_id: request_id || null,  
                action: "get_tweets",
                data: response.data,
            });
        }

        return res.status(400).json({ error: `Unknown action ${action}` });
    } 
    
    catch (err) {
        res.status(500).json({
            error: "Failed to process MCP request",
            details: err.message,
        });
    }
});





app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
