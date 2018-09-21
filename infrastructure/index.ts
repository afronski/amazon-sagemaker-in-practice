import { App, PolicyStatement, ServicePrincipal, Stack, StackProps } from '@aws-cdk/cdk';
import { Bucket } from '@aws-cdk/aws-s3';
import { Group, Policy, Role, User } from '@aws-cdk/aws-iam';

const PARTICIPANT_AMOUNT = 30;
const AMAZON_SAGEMAKER_PRINCIPAL = 'sagemaker.amazonaws.com'

interface AmazonSageMakerInPracticeStackProps extends StackProps {
  password: string;
  region: string;
}

class AmazonSageMakerInPracticeStack extends Stack {
  constructor(parent: App, id: string, props?: AmazonSageMakerInPracticeStackProps) {
    super(parent, id, props);

    const amazonSageMakerRole = new Role(this, 'AmazonSageMakerInPracticeRole', {
      assumedBy: new ServicePrincipal(AMAZON_SAGEMAKER_PRINCIPAL),
      roleName: 'amazon-sagemaker-in-practice-workshop-role'
    });

    amazonSageMakerRole.attachManagedPolicy('arn:aws:iam::aws:policy/AmazonSageMakerFullAccess');

    const participantsGroup = new Group(this, 'AmazonSageMakerInPracticeParticipants');
    const policy = new Policy(this, 'AmazonSageMakerInPracticeParticipantsPolicy');

    const permissions = [
      "sagemaker:*",
      "ecr:*",
      "cloudwatch:*",
      "logs:*",

      "s3:GetBucketLocation",
      "s3:ListAllMyBuckets",

      "iam:ListRoles",
      "iam:GetRole"
    ];

    const defaultStatement = (new PolicyStatement()).allow().addAllResources().addActions(...permissions);

    const condition = { 'iam:PassedToService': AMAZON_SAGEMAKER_PRINCIPAL };
    const passRole = (new PolicyStatement()).allow().addAllResources().addAction("iam:PassRole").addCondition("StringEquals", condition);

    policy.addStatement(defaultStatement);
    policy.addStatement(passRole);

    participantsGroup.attachInlinePolicy(policy);

    const dataSource = Bucket.import(this, 'DataSourceBucket', {
      bucketArn: 'arn:aws:s3:::amazon-sagemaker-in-practice-workshop'
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
      password: this.getContext("password"),
      region: this.getContext("region")
    });
  }
}

process.stdout.write(new MyApp(process.argv).run());
