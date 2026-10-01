// Runs test scripts one after another with RULES_DIR set (works under Windows cmd too).
//   node run-suite.cjs <rulesDir> script1.cjs script2.cjs ...
const {spawnSync}=require('node:child_process');
const [dir,...scripts]=process.argv.slice(2);
for(const s of scripts){
 const r=spawnSync(process.execPath,[s],{stdio:'inherit',cwd:__dirname,env:{...process.env,RULES_DIR:dir}});
 if(r.status!==0){console.log('\n'+s+' failed with RULES_DIR='+dir);process.exit(r.status||1)}
}
