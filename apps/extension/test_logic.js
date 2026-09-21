function test() {
  const currentCustomerText = "No\n7:04 pm";
  const initialLastCustomerText = "Yes\n6:57 pm";
  
  if (currentCustomerText !== initialLastCustomerText) {
      let rawText = currentCustomerText;
      let textParts = rawText.split('\n').map(p => p.trim()).filter(p => p.length > 0);
      
      if (textParts.length > 0) {
          const lastPart = textParts[textParts.length - 1];
          if (lastPart.match(/^\d{1,2}:\d{2}(\s*(am|pm|AM|PM))?$/i)) {
              textParts.pop();
          }
      }
      
      const cleanText = textParts.join(' ').toLowerCase();
      console.log("cleanText:", cleanText);
      
      if (cleanText.includes('yes') || cleanText.match(/\by\b/) || cleanText.match(/\b1\b/)) {
          console.log("GRANTED");
      } else if (cleanText.includes('no') || cleanText.match(/\bn\b/) || cleanText.match(/\b2\b/)) {
          console.log("DENIED");
      } else {
          console.log("NOT MATCHED");
      }
  }
}
test();
