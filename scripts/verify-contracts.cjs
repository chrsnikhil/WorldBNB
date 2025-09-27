const hre = require("hardhat");

async function main() {
  console.log("🔍 Verifying contracts on World Chain block explorer...");
  
  const propertyHostingAddress = "0x054005548De2e68096407E62f7D851062f6364Eb";
  const propertyBookingAddress = "0x172588edc79112AfF78C417b41826851f3BB1692";
  
  try {
    console.log("📋 Verifying PropertyHosting contract...");
    await hre.run("verify:verify", {
      address: propertyHostingAddress,
      constructorArguments: [],
    });
    console.log("✅ PropertyHosting verified successfully!");
    
    console.log("📋 Verifying PropertyBooking contract...");
    await hre.run("verify:verify", {
      address: propertyBookingAddress,
      constructorArguments: [propertyHostingAddress], // PropertyBooking constructor takes PropertyHosting address
    });
    console.log("✅ PropertyBooking verified successfully!");
    
    console.log("\n🎉 All contracts verified successfully!");
    console.log("🔗 View your contracts on Tenderly:");
    console.log(`   PropertyHosting: https://worldchain.tenderly.co/contract/worldchain/${propertyHostingAddress}`);
    console.log(`   PropertyBooking: https://worldchain.tenderly.co/contract/worldchain/${propertyBookingAddress}`);
    
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.log("\n🔧 Manual verification steps:");
      console.log("1. Go to https://worldchain.tenderly.co/");
      console.log("2. Search for your contract address");
      console.log("3. Click 'Verify' and upload the source code");
      console.log("4. Use the contract ABI from artifacts/contracts/");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
