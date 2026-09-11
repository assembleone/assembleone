from pathlib import Path
p=Path('Studio-Recovery.html')
s=p.read_text(encoding='utf-8')
old='''const mainAction=compact?(ownerSelected?ownerSend:''):(ownerSelected?ownerSend:'<button type="button" class="fitter-whatsapp-btn" data-fitter-whatsapp="'+safe(rowKey)+'" title="'+safe(actionTitle)+'">'+actionIcon+'</button>');'''
new='''const fitterWhatsapp=ownerSelected?'':'<button type="button" class="fitter-whatsapp-btn" data-fitter-whatsapp="'+safe(rowKey)+'" title="'+safe(actionTitle)+'">'+actionIcon+'</button>';
    // Send to Mobile is always available after choosing either Owner or a named fitter.
    // Assignment decides who receives the job; this explicit button performs the send.
    const mainAction=compact?ownerSend:(ownerSend+fitterWhatsapp);'''
if s.count(old)!=1:
    raise SystemExit(f'Expected one fitter mainAction block, found {s.count(old)}')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')
