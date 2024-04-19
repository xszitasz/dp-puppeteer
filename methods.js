const getQueryData = require('./dataDb');
const CustomError = require('./customError.js');
const { insertReportFinal } = require('./utils');

function formatMilliseconds(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(3);
  return `minutes: ${minutes} seconds: ${seconds}`;
}

async function login(page, userData, startTime) {
  let loginErrorCount = 2;
  const args = process.argv.slice(2);

  while(loginErrorCount > 0) {
    try {
      const frame = page.frames()[1];
      const loginId = await frame.$('#EKAC\\.Login\\.LoginInputField');
      const passwordId = await frame.$('#EKAC\\.Login\\.PasswordInputField');
  
      if (loginId) {
        await loginId.type(userData[0].user_name);
      }
      if (passwordId) {
        await passwordId.type(userData[0].pwd);
      }
  
      const submitButton = await frame.$('#EKAC\\.Login\\.Button');
      await submitButton.click();
  
      await frame.waitForTimeout(500);
      const radioButton = await frame.$('#EKAC\\.HeaderView\\.EICRadioButtonGroupByKey\\:0-lbl');
      await radioButton.click();

      break;
    } catch (err) {
      console.error('Error-login: ', err.message);
      loginErrorCount--;
    }

    if(loginErrorCount === 0) {
      const customError = new CustomError('Login Error', 0x1);
      const elapsedMilliseconds = Date.now() - startTime;
      const elapsedTimeString = formatMilliseconds(elapsedMilliseconds);
      await insertReportFinal(args[0], -2, 'Puppeteer', 'failure', 'Cannot login for USER_ID: ' + args[0], elapsedTimeString);
      customError.exitProcess();
    }
  }
}

async function fillForm(page, startTime){
  const frame = page.frames()[1];
  const pageData = await getQueryData(startTime);
  const userId = pageData[0].user_id;
  const consId = pageData[0].cons_id;
  const invalidDataTypes = [];
  let fillErrorCount = 2, saveButton, text, saveErrorCount = 2, saveErrorCountInner = 2, timeErrorCount = 2;

  while(fillErrorCount > 0) {
    try {
      for(const [key, value] of Object.entries(pageData[0])) {
        if(key !== 'cons_id' && key !== 'user_id') {
          try {
            await frame.waitForTimeout(500);
            const selector = `#EKAC\\.DenneNahlasovanieView\\.${key}`;
    
            if (!selector) {
              console.log(`Selector is null or undefined: ${key}`);
              continue;
            }
    
            const element = await frame.$(selector);
            let newValue = value ? value.toString() : '';
    
            if (element && (await element.isVisible())) {
              if (selector !== '#EKAC\\.DenneNahlasovanieView\\.DatumInputField') {
                newValue = newValue.replace('.', ',');
                if (!/^-?\d+(\,\d+)?$/.test(newValue)) {
                  invalidDataTypes.push(`${key}: ${value}`);
                }
              }
              await element.click({ clickCount: 10 });
              await element.press('Backspace');
              await element.type(newValue);
            }
          } catch (err) {
            console.error(`Error-fill inputs in row (user_id: ${userId}, cons_id: ${consId}): ${err.message}`);
            continue;
          }
        }
      }
      break;
    }catch(err) {
      fillErrorCount--;
      console.error('Error-fill: ', err.message);
    }
  }
  
  while(saveErrorCount > 0) {
    try {
      saveButton = await frame.waitForSelector('#EKAC\\.DenneNahlasovanieView\\.SaveButton');
      await saveButton.click();
      await frame.waitForTimeout(500);
      
      while(saveErrorCountInner > 0) { 
        try {
          const messageAreaElement = await frame.waitForSelector('#EKAC\\.\\.WD_MessageArea-txt', { timeout: 4000 });
          const textHandle = await messageAreaElement.getProperty('textContent');
          text = await textHandle.jsonValue();
          break;
        } catch (err) {
          saveErrorCountInner--;
          console.error('Failed to find the message area element:', err.message);
        }
      }
      break;
    }catch(err){
      saveErrorCount--;
      console.error('Failed to find or click the save button:', err.message);
    }
  }

  while(timeErrorCount > 0) {
    try {
      const elapsedMilliseconds = Date.now() - startTime;
      const elapsedTimeString = formatMilliseconds(elapsedMilliseconds);

      if(text !== 'Údaje boli uložené do databázy') {
        await insertReportFinal(userId, consId, 'Puppeteer', 'failed', invalidDataTypes.join(' | '), elapsedTimeString);
      } else {
        await insertReportFinal(userId, consId, 'Puppeteer', 'success', 'Report filled out', elapsedTimeString);
      }
      break;
    }catch(err){
      console.error("Error-time: " + err + ", Error time-number: " + timeErrorCount);
      timeErrorCount--;
    }
  }

  if(timeErrorCount === 0 || fillErrorCount === 0 || saveErrorCount === 0 || saveErrorCountInner === 0){
    const customError = new CustomError('Script failed multiple times', 0x1);
    customError.exitProcess();
  }
}

module.exports = {
  login,
  fillForm
};
