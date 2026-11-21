// Proves the Custom Sheets rule addition is purely additive and sits in the right place of the repo's firestore.rules:
// every original line is still there in the same order, only the block's lines are new, it lands directly before
// `match /invitations/{inviteId}` inside `match /companies/{companyId}`, and the braces balance. Also exports compose() for the rules test.
const fs=require('fs'),path=require('path'),assert=require('assert');
const dir=__dirname,rulesPath=path.join(dir,'..','firestore.rules');
function compose(){
 const base=fs.readFileSync(rulesPath,'utf8'),block=fs.readFileSync(path.join(dir,'firestore-rules-addition.txt'),'utf8');
 const anchor='      match /invitations/{inviteId} {';assert.equal(base.split(anchor).length-1,1,'anchor appears exactly once');
 return {base,block,merged:base.replace(anchor,block+anchor)};
}
module.exports={compose};
if(require.main===module){
 const {base,block,merged}=compose();
 assert(!/estimatorSheets/.test(base),'the repo firestore.rules must stay WITHOUT the block (it is added by hand in the Console)');
 const b=base.split('\n'),m=merged.split('\n');let j=0,added=[];
 for(const line of m){if(j<b.length&&line===b[j])j++;else added.push(line)}
 assert.equal(j,b.length,'every original line kept, in order');
 assert.deepEqual(added,block.replace(/\n$/,'').split('\n'),'only the block was added');
 const count=(s,c)=>s.split(c).length-1;assert.equal(count(block,'{'),count(block,'}'),'block braces balance');assert.equal(count(merged,'{'),count(merged,'}'),'merged braces balance');
 const iBlock=m.findIndex(l=>/match \/estimatorSheets/.test(l)),iInv=m.findIndex(l=>/match \/invitations/.test(l)),iCompanies=m.findIndex(l=>/match \/companies\/\{companyId\} \{/.test(l));
 assert(iCompanies<iBlock&&iBlock<iInv,'block sits inside the companies block, before invitations');
 console.log('PASS firestore-rules-addition-check: '+added.length+' lines added, 0 changed, 0 removed');
}
