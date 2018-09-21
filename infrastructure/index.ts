import { App, PolicyStatement, Stack, StackProps } from '@aws-cdk/cdk';
import { Bucket } from '@aws-cdk/aws-s3';
import { Group, Policy, User } from '@aws-cdk/aws-iam';

const PARTICIPANT_AMOUNT = 30;

interface AmazonSageMakerInPracticeStackProps extends StackProps {
  password: string;
}

class AmazonSageMakerInPracticeStack extends Stack {
  constructor(parent: App, id: string, props?: AmazonSageMakerInPracticeStackProps) {
    super(parent, id, props);

    const participantsGroup = new Group(this, 'AmazonSageMakerInPracticeParticipants');
    const policy = new Policy(this, 'AmazonSageMakerInPracticeParticipantsPolicy');

    const permissions = [
      "sagemaker:*",
      "ecr:*",
      "cloudwatch:*",
      "logs:*",
    ];

    const statement = (new PolicyStatement()).allow().addAllResources().addActions(...permissions);

    policy.addStatement(statement);
    participantsGroup.attachInlinePolicy(policy);

    const dataSource = Bucket.import(this, 'DataSourceBucket', {
      bucketArn: 'arn:aws:s3:::amazon-sagemaker-in-practice.pattern-match.com'
    });

    dataSource.grantRead(participantsGroup);

    for (let index = 1; index <= PARTICIPANT_AMOUNT; ++index) {
      let participant = new User(this, `User${index}`, {
        userName: `amazon-sagemaker-in-practice-user-${index}`,
        password: props.password,
        groups: [ participantsGroup ]
      });

      let userBucket = new Bucket(this, `ParticipantBucket${index}`, {
        bucketName: `amazon-sagemaker-in-practice-bucket-user-${index}`
      });

      userBucket.grantReadWrite(participant);
    }

    return this;
  }
}

class MyApp extends App {
  constructor(argv: string[]) {
    super(argv);

    new AmazonSageMakerInPracticeStack(this, 'amazon-sagemaker-in-practice-infrastructure', {
      password: this.getContext("password")
    });
  }
}

process.stdout.write(new MyApp(process.argv).run());
