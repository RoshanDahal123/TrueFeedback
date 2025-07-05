import {
  Html,
  Head,
  Preview,
  Heading,
  Row,
  Section,
  Text,
} from "@react-email/components";

interface VerificationEmailProps {
  username: string;
  otp: string;
}
const VerificationEmail = ({ username, otp }: VerificationEmailProps) => {
  return (
    <Html lang="en" dir="ltr">
      <Head />

      <Preview>Verification Code</Preview>
      <Section style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <Row>
          <Heading style={{ textAlign: "center" }}>
            Here&apos;s your verification code, {otp}
          </Heading>
        </Row>
        <Row>
          <Text style={{ marginTop: "20px" }}>
            Thank you for registering, {username}! Please use the code below to
            verify your email address and complete your registration.
          </Text>
        </Row>
        <Row>
          <Text
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              textAlign: "center",
              marginTop: "10px",
            }}
          >
            {otp}
          </Text>
          <Text>
            If you did not request this verification, please ignore this email.
          </Text>
        </Row>
        {/* <Row>
          <Button
            href="https://yourapp.com/verify"
            style={{
              display: "block",
              width: "200px",
              margin: "20px auto",
              backgroundColor: "#007BFF",
              color: "#FFFFFF",
              textDecoration: "none",
              textAlign: "center",
              padding: "10px 0",
            }}
          >
            Verify Email
          </Button> */}
        {/* </Row> */}
      </Section>
    </Html>
  );
};

export default VerificationEmail;
