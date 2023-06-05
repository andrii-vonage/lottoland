const isDebug = process.env.NODE_ENV === "development";
const isSandbox = process.env.OPTIMOVE_ENV === "sandbox";

const links = {
    debug: {
        GB: "http://localhost:3000/opt-out/GB",
        DE: "http://localhost:3000/opt-out/DE",
        PL: "http://localhost:3000/opt-out/PL",
        SE: "http://localhost:3000/opt-out/SE",
        BR: "http://localhost:3000/opt-out/BR",
        SK: "http://localhost:3000/opt-out/SK",
        HU: "http://localhost:3000/opt-out/HU",
        MX: "http://localhost:3000/opt-out/MX",
        AU: "http://localhost:3000/opt-out/AU",
    },
    sandbox: {
        GB: "https://neru-59e69cd7-lottoland-sandbox-dev.euw1.serverless.vonage.com/opt-out/GB",
        DE: "https://neru-59e69cd7-lottoland-sandbox-dev.euw1.serverless.vonage.com/opt-out/DE",
        PL: "https://neru-59e69cd7-lottoland-sandbox-dev.euw1.serverless.vonage.com/opt-out/PL",
        SE: "https://neru-59e69cd7-lottoland-sandbox-dev.euw1.serverless.vonage.com/opt-out/SE",
        BR: "https://neru-59e69cd7-lottoland-sandbox-dev.euw1.serverless.vonage.com/opt-out/BR",
        SK: "https://neru-59e69cd7-lottoland-sandbox-dev.euw1.serverless.vonage.com/opt-out/SK",
        HU: "https://neru-59e69cd7-lottoland-sandbox-dev.euw1.serverless.vonage.com/opt-out/HU",
        MX: "https://neru-59e69cd7-lottoland-sandbox-dev.euw1.serverless.vonage.com/opt-out/MX",
        AU: "https://neru-59e69cd7-lottoland-sandbox-dev.euw1.serverless.vonage.com/opt-out/AU",
    },
    production: {
        GB: "https://bit.ly/3WTqzcq",
        DE: "https://bit.ly/43nKjY2",
        PL: "https://bit.ly/43FMA0d",
        SE: "https://bit.ly/3qrQ604",
        BR: "https://bit.ly/3oN7Cvb",
        SK: "https://bit.ly/43M44s5",
        HU: "https://bit.ly/3C8xAfT",
        MX: "https://bit.ly/3MPEdbQ",
        AU: "https://bit.ly/3Ndvsd5",
    },
};

export const getOptOutLink = (country: string) => {
    if (isDebug) {
        return links.debug[country];
    } else if (isSandbox) {
        return links.sandbox[country];
    } else {
        return links.production[country];
    }
}