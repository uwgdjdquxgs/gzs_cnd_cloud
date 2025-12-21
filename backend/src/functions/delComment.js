const { app, input, output } = require('@azure/functions');

// 定义输入 (读取)
const cosmosInput = input.cosmosDB({
    databaseName: 'Stores',
    containerName: 'DBcontainer',
    connection: 'CosmosDBConnection',
    id: '{postId}',
    partitionKey: '{postId}'
});

// 定义输出 (保存)
const cosmosOutput = output.cosmosDB({
    databaseName: 'Stores',
    containerName: 'DBcontainer',
    connection: 'CosmosDBConnection',
    createIfNotExists: false
});

app.http('delComment', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'delComment/{postId}',
    extraInputs: [cosmosInput],
    extraOutputs: [cosmosOutput],
    handler: async (request, context) => {
        const inputDocument = context.extraInputs.get(cosmosInput);

        if (!inputDocument) {
            return { status: 404, body: "Post not found" };
        }

        let body;
        try {
            body = await request.json();
        } catch (error) {
            return { status: 400, body: "Invalid JSON" };
        }

        const targetCommentId = body.commentId;

        if (!targetCommentId || !inputDocument.comments) {
            return { status: 400, body: "Missing commentId or list empty" };
        }

        // 过滤删除
        const originalLength = inputDocument.comments.length;
        inputDocument.comments = inputDocument.comments.filter(c => c.commentId !== targetCommentId);

        if (inputDocument.comments.length === originalLength) {
            return { status: 404, body: "Comment ID not found" };
        }

        // 保存更改
        context.extraOutputs.set(cosmosOutput, inputDocument);

        return {
            status: 200,
            jsonBody: { message: "Comment deleted" }
        };
    }
});