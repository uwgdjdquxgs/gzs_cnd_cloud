const { app, input, output } = require('@azure/functions');

// 1. 输入绑定：读取帖子
const cosmosInput = input.cosmosDB({
    databaseName: 'Stores',
    containerName: 'DBcontainer',
    connection: 'CosmosDBConnection',
    id: '{postId}',
    partitionKey: '{postId}'
});

// 2. 输出绑定：保存帖子
const cosmosOutput = output.cosmosDB({
    databaseName: 'Stores',
    containerName: 'DBcontainer',
    connection: 'CosmosDBConnection',
    createIfNotExists: false
});

app.http('addLike', {
    methods: ['POST'], // 用 POST 触发
    authLevel: 'anonymous',
    route: 'addLike/{postId}', // 路由带参数
    extraInputs: [cosmosInput],
    extraOutputs: [cosmosOutput],
    handler: async (request, context) => {
        const inputDocument = context.extraInputs.get(cosmosInput);

        if (!inputDocument) {
            return { status: 404, body: "Post not found" };
        }

        // 3. 初始化 likes (如果老数据没有这个字段)
        if (!inputDocument.likes) {
            inputDocument.likes = 0;
        }

        // 4. 点赞 +1
        inputDocument.likes++;

        // 5. 保存回数据库
        context.extraOutputs.set(cosmosOutput, inputDocument);

        return {
            status: 200,
            jsonBody: {
                message: "Like added",
                newLikes: inputDocument.likes
            }
        };
    }
});