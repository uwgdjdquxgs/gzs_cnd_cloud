const { app, input, output } = require('@azure/functions');

// 1. 定义 Cosmos DB 输入绑定 (读取帖子)
const cosmosInput = input.cosmosDB({
    databaseName: 'Stores',
    containerName: 'DBcontainer',
    connection: 'CosmosDBConnection',
    id: '{postId}',
    partitionKey: '{postId}'
});

// 2. 定义 Cosmos DB 输出绑定 (保存帖子)
const cosmosOutput = output.cosmosDB({
    databaseName: 'Stores',
    containerName: 'DBcontainer',
    connection: 'CosmosDBConnection',
    createIfNotExists: false
});

app.http('addComment', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'addComment/{postId}',
    extraInputs: [cosmosInput],
    extraOutputs: [cosmosOutput],
    handler: async (request, context) => {
        // 3. 从输入绑定获取当前帖子
        const inputDocument = context.extraInputs.get(cosmosInput);

        if (!inputDocument) {
            return { status: 404, body: "Post not found" };
        }

        // 4. 解析前端发来的 Body
        // 注意：V4 中 request.json() 是个 Promise，或者直接用 request.body (如果是解析过的)
        // 为了稳妥，我们用 request.json()
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return { status: 400, body: "Invalid JSON" };
        }

        const { commentName, commentText } = body;

        if (!commentName || !commentText) {
            return { status: 400, body: "Missing name or text" };
        }

        // 5. 构造新评论
        const newComment = {
            commentId: new Date().getTime().toString(),
            commentName: commentName,
            commentText: commentText,
            commentTime: new Date().toISOString()
        };

        // 6. 追加到数组
        if (!inputDocument.comments) {
            inputDocument.comments = [];
        }
        inputDocument.comments.push(newComment);

        // 7. 设置输出 (保存回数据库)
        context.extraOutputs.set(cosmosOutput, inputDocument);

        // 8. 返回给前端
        return {
            status: 200,
            jsonBody: {
                message: "Comment added",
                data: newComment
            }
        };
    }
});