// Reads a FittersIQ Supplier PDF back the way a printer would: renders each page at 100%
// with pdf.js at the given dpi, measures every sticker (line centre to line centre), the QR
// and the 100 mm check ruler, scans each QR with jsQR and extracts the sticker text.
// Used by supplier-pack-pdf.cjs and supplier-export.cjs.
const PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',PDFJS_WORKER='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',JSQR='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
async function pdfReader(ctx){
 const reader=await ctx.newPage();
 await reader.setContent('<html><body></body></html>');
 await reader.addScriptTag({url:PDFJS});await reader.addScriptTag({url:JSQR});
 async function analyse(bytes,dpi){
  return reader.evaluate(async({b64,dpi,worker})=>{
   pdfjsLib.GlobalWorkerOptions.workerSrc=worker;
   const pdf=await pdfjsLib.getDocument({data:Uint8Array.from(atob(b64),c=>c.charCodeAt(0))}).promise;
   const MM=72/25.4,out={pages:[],stickers:[],rulers:[]};
   for(let n=1;n<=pdf.numPages;n++){
    const pg=await pdf.getPage(n),vp1=pg.getViewport({scale:1});
    const items=(await pg.getTextContent()).items.filter(i=>i.str.trim()).map(i=>({s:i.str,x:i.transform[4],y:vp1.height-i.transform[5],w:i.width}));
    const text=items.map(i=>i.s).join(' ');
    out.pages.push({wMm:vp1.width/MM,hMm:vp1.height/MM,text});
    if(!/Print at 100% \/ Actual Size/.test(text))continue;
    const scale=dpi/72,vp=pg.getViewport({scale}),cv=document.createElement('canvas');cv.width=Math.round(vp.width);cv.height=Math.round(vp.height);
    const ctx=cv.getContext('2d');await pg.render({canvasContext:ctx,viewport:vp}).promise;
    const img=ctx.getImageData(0,0,cv.width,cv.height),W=cv.width,pxmm=dpi/25.4;
    const dark=(x,y)=>{const i=(Math.round(y)*W+Math.round(x))*4;return img.data[i]*0.3+img.data[i+1]*0.59+img.data[i+2]*0.11<128};
    const run=(x,y,dx,dy)=>{let k=0;while(dark(x+dx*k,y+dy*k))k++;return k};
    // Ruler: the 100 mm line.
    const ry=39*pxmm;let rl=null,rr=null;for(let x=5*pxmm;x<150*pxmm;x++)if(dark(x,ry)){if(rl===null)rl=x;rr=x}
    out.rulers.push((rr-rl)/pxmm);
    for(const it of items.filter(i=>/^P-\d+$/.test(i.s))){
     const by=it.y*scale;
     const cxp=(it.x+it.w/2)*scale;
     const row=by+20*pxmm;let right=null;for(let x=cxp;x<cxp+25*pxmm;x++)if(dark(x,row))right=x;
     let left=null;for(let x=right-93*pxmm;x<right;x++)if(dark(x,row)){left=x;break}
     const col=left+20*pxmm;let top=null;for(let y=by-12*pxmm;y<by+50*pxmm;y++)if(dark(col,y)){top=y;break}
     let bottom=null;for(let y=top;y<top+52*pxmm;y++)if(dark(col,y))bottom=y;
     const tl=run(left,row,1,0),tr=run(right,row,-1,0),tt=run(col,top,0,1),tb=run(col,bottom,0,-1);
     const wMm=((right-tr/2)-(left+tl/2)+1)/pxmm,hMm=((bottom-tb/2)-(top+tt/2)+1)/pxmm,lineMm=tl/pxmm;
     const pad=4*pxmm,sx=Math.round(left+pad*0.4),sy=Math.round(top+pad*0.4),sw=Math.round(right-left-pad*0.8),sh=Math.round(bottom-top-pad*0.8);
     // QR alone (right part of the sticker) with white quiet zone added, as a scanner sees a cut sticker.
     const qx=Math.round(cxp-19*pxmm),qy=Math.round(by+0.6*pxmm),qs=Math.round(38.5*pxmm),q=document.createElement('canvas'),qp=Math.round(6*pxmm);q.width=q.height=qs+2*qp;
     const qc=q.getContext('2d');qc.fillStyle='#fff';qc.fillRect(0,0,q.width,q.height);qc.drawImage(cv,qx,qy,qs,qs,qp,qp,qs,qs);
     const code=jsQR(qc.getImageData(0,0,q.width,q.height).data,q.width,q.height);
     // Whole sticker as cut (border included), no extra white added.
     const whole=document.createElement('canvas');whole.width=sw;whole.height=sh;const wc=whole.getContext('2d');wc.drawImage(cv,sx,sy,sw,sh,0,0,sw,sh);
     const code2=jsQR(wc.getImageData(0,0,sw,sh).data,sw,sh);
     const qrMm=code?Math.hypot(code.location.topRightCorner.x-code.location.topLeftCorner.x,code.location.topRightCorner.y-code.location.topLeftCorner.y)/pxmm:0;
     const inBox=items.filter(i=>{const x=i.x*scale,y=i.y*scale;return x>left&&x<right&&y>top&&y<bottom+2});
     const leftText=inBox.filter(i=>i.x*scale<cxp-18.5*pxmm).sort((a,b)=>a.y-b.y||a.x-b.x).map(i=>i.s.trim()).join(' ');
     out.stickers.push({page:n,code:it.s,wMm,hMm,lineMm,qrMm,qr:code?code.data:null,qrWhole:code2?code2.data:null,left:leftText});
    }
   }
   return out;
  },{b64:bytes.toString('base64'),dpi,worker:PDFJS_WORKER});
 }
 return analyse;
}
module.exports={pdfReader,JSQR};
