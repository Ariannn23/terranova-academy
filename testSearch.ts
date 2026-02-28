import { searchStudentsForPayment } from "./src/lib/actions/payments.actions";

async function main() {
  const res = await searchStudentsForPayment("Test");
  console.log("Result for 'Test':", JSON.stringify(res, null, 2));
}

main().catch(console.error);
