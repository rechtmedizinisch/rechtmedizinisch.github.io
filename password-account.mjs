// Passwords belong to the existing shared account, never to a separate web profile.
export async function saveAccountPassword(client,owner,password,{nonce='',currentPassword=''}={}){
 if(!owner)throw Error('authentication_required');
 if([...password].length<12)throw Error('password_too_short');
 const {data:before,error:beforeError}=await client.auth.getUser();
 if(beforeError)throw beforeError;
 if(before?.user?.id!==owner)throw Error('account_changed');
 const attributes={password};
 if(nonce.trim())attributes.nonce=nonce.trim();
 if(currentPassword)attributes.current_password=currentPassword;
 const {data,error}=await client.auth.updateUser(attributes);
 if(error)throw error;
 if(data?.user?.id!==owner)throw Error('account_changed');
 return data.user;
}
export async function requestPasswordConfirmation(client,owner){
 if(!owner)throw Error('authentication_required');
 const {data,error}=await client.auth.getUser();if(error)throw error;
 if(data?.user?.id!==owner)throw Error('account_changed');
 const {error:confirmationError}=await client.auth.reauthenticate();
 if(confirmationError)throw confirmationError;
}
export function passwordError(error){
 const code=error?.code??error?.message;
 if(code==='reauthentication_needed'||code==='reauthentication_not_valid')return {confirmation:true,text:'Bitte bestätigen Sie die Passwortänderung mit einem neuen E-Mail-Code.'};
 if(code==='current_password_missing'||code==='current_password_invalid')return {currentPassword:true,text:'Bitte geben Sie zur Bestätigung Ihr bisheriges Passwort ein.'};
 if(code==='password_too_short')return {text:'Bitte verwenden Sie mindestens 12 Zeichen.'};
 if(code==='weak_password')return {text:'Bitte wählen Sie ein stärkeres Passwort mit mindestens 12 Zeichen.'};
 if(code==='same_password')return {text:'Dieses Passwort ist bereits eingerichtet. Sie können sich damit anmelden.'};
 if(code==='account_changed'||code==='authentication_required')return {text:'Bitte melden Sie sich erneut mit dem gewünschten Konto an.'};
 if(error?.status===429)return {text:'Zu viele Versuche. Bitte warten Sie kurz und versuchen Sie es erneut.'};
 return {text:'Das Passwort konnte nicht gespeichert werden. Bitte versuchen Sie es erneut oder melden Sie sich vorher per E-Mail-Code an.'};
}
