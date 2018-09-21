"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cdk_1 = require("@aws-cdk/cdk");
const aws_s3_1 = require("@aws-cdk/aws-s3");
const aws_iam_1 = require("@aws-cdk/aws-iam");
const PARTICIPANT_AMOUNT = 30;
class AmazonSageMakerInPracticeStack extends cdk_1.Stack {
    constructor(parent, id, props) {
        super(parent, id, props);
        const participantsGroup = new aws_iam_1.Group(this, 'AmazonSageMakerInPracticeParticipants');
        const policy = new aws_iam_1.Policy(this, 'AmazonSageMakerInPracticeParticipantsPolicy');
        const permissions = [
            "sagemaker:*",
            "ecr:*",
            "cloudwatch:*",
            "logs:*",
        ];
        const statement = (new cdk_1.PolicyStatement()).allow().addAllResources().addActions(...permissions);
        policy.addStatement(statement);
        participantsGroup.attachInlinePolicy(policy);
        const dataSource = aws_s3_1.Bucket.import(this, 'DataSourceBucket', {
            bucketArn: 'arn:aws:s3:::amazon-sagemaker-in-practice.pattern-match.com'
        });
        dataSource.grantRead(participantsGroup);
        for (let index = 1; index <= PARTICIPANT_AMOUNT; ++index) {
            let participant = new aws_iam_1.User(this, `User${index}`, {
                userName: `amazon-sagemaker-in-practice-user-${index}`,
                password: props.password,
                groups: [participantsGroup]
            });
            let userBucket = new aws_s3_1.Bucket(this, `ParticipantBucket${index}`, {
                bucketName: `amazon-sagemaker-in-practice-bucket-user-${index}`
            });
            userBucket.grantReadWrite(participant);
        }
        return this;
    }
}
class MyApp extends cdk_1.App {
    constructor(argv) {
        super(argv);
        new AmazonSageMakerInPracticeStack(this, 'amazon-sagemaker-in-practice-infrastructure', {
            password: this.getContext("password")
        });
    }
}
process.stdout.write(new MyApp(process.argv).run());
