// --- block 1 ---


const APP_I18N={
 en:{start:'Start Project',startHelp:'Type in the job and choose what you are building. Rooms stay inside the project and are sent to the phone automatically.',job:'What are you working on?',summary:'Finish Job',summaryHelp:'One last visual check, then save or send a note to the install team.',finish:'Send to Phone or iPad',noteLabel:'Note for the phone',noteHint:'This is sent on its own, separate from the cutting list — good for a quick message about this job, any stage.',notePlaceholder:"Example: Red's wardrobe — customer wants soft-close hinges, confirm before fitting.",noteSendBtn:'Send Note to Phone',noteSendSmall:'Just this note, no cutting list needed',
  'bom.pcsShort':'pcs','bomScreen.deleteJob':'Delete this job','bomScreen.saveProject':'Save Project','bomScreen.saveProjectSub':'Keep all Studio changes','bomScreen.templateCheck':'Template and Hardware Check','bomScreen.templateCheckSub':'Double check panels, hinges, lights, rails, drawers and fittings before sending.',
  'customers.addCustomer':'💾 Add customer','customers.address':'Address','customers.backToCustomers':'← Customers','customers.cancel':'Cancel','customers.delete':'🗑 Delete','customers.edit':'✏️ Edit','customers.heading':'Customers','customers.name':'Name','customers.newCustomer':'+ New customer','customers.phone':'Phone','customers.save':'💾 Save','customers.searchPlaceholder':'Search customers...','customers.subtitle':'Every job, saved and organised by customer.',
  'drawing.back':'Back','drawing.catDoors':'Doors and drawers','drawing.catInfills':'Infills and fillers','drawing.catKitchen':'Kitchen cabinets','drawing.catTv':'TV walls and furniture','drawing.catUtility':'Utility and special parts','drawing.catWardrobes':'Wardrobes and cabinets','drawing.checkAllPanels':'✓ Check All Panels','drawing.chooseDrawing':'Choose drawing','drawing.chosenParts':'Chosen Parts','drawing.delete':'Delete','drawing.dropHere':'Drop a drawing, screenshot or photo here','drawing.dropHereHint':'Use the buttons above, drag a drawing into this box, or press Ctrl + V after copying a screenshot.','drawing.dropHereSub':'Paste, drop, choose a file or take a photo.','drawing.edgeBandingTitle':'Double-click to add edge banding','drawing.edgeHelp':'Double-click the length or width number to add edge banding: no line → one line → double line.','drawing.fit':'Fit','drawing.fitDrawing':'Fit drawing','drawing.leftRight':'Left / Right','drawing.length':'Length','drawing.makeUnique':'Make selected marker unique','drawing.materialChooseOnce':'Material — choose once for this job','drawing.materialHint':'Type the exact material name used for this job.','drawing.materialPrefix':'Material','drawing.morePartNames':'More part names','drawing.noDrawing':'No drawing','drawing.noPanelSelected':'No panel selected','drawing.notesHint':'Add or use another note','drawing.notesOptional':'Notes — optional','drawing.notesPrefix':'Notes','drawing.panelOptions':'Panel options','drawing.partName':'Part name','drawing.partNamePlaceholder':'Choose or type a part name…','drawing.partSelected':'Part selected','drawing.pasteDrawing':'Paste drawing','drawing.pasteTitle':'Paste a copied screenshot or image','drawing.putSameNumber':'+ Put same number on drawing','drawing.quantity':'Quantity','drawing.samePanelMarkers':'Same panel markers:','drawing.saveMaterial':'Save material','drawing.saveNext':'Save & next','drawing.thickness':'Thickness','drawing.topBottom':'Top / Bottom','drawing.width':'Width','drawing.zoomIn':'Zoom in','drawing.zoomOut':'Zoom out',
  'home.addLabel':'Add','home.addUnitBelow':'Add the correct unit below.','home.addWardrobe':'+ Add wardrobe or cabinet','home.back':'← Back','home.back2':'Back','home.backHome':'← Home','home.chooseRoomHeading':'Choose room','home.chooseRoomHint':'Tap a large picture button. The room stays inside this project and is sent to the phone automatically.','home.chooseRoomHint2':'Choose a room above, then add the correct furniture for that room.','home.continueJob':'Continue Current Job','home.currentJobFallback':'Current job','home.customerLabel':'Customer','home.customerPlaceholder':'Customer name','home.customersJobs':'Customers and Jobs','home.customersJobsSub':'View all customers and their projects','home.jobNameHint':'Name the job once, then choose the room you are working in.','home.jobNameLabel':'Job name','home.jobNamePlaceholder':'e.g. Simone house','home.newProject':'New Project','home.newProjectSub':'Start a new customer or project','home.openJobHint':'Open the job you are working on','home.recentJobs':'Recent Jobs','home.recentJobsSub':'Your recently opened jobs','home.saveTemplateLater':'＋ Save a new template later','home.selectedRoomPrefix':'Selected room:','home.siteJobs':'Site Jobs','home.siteJobsNew':'New jobs sent from your phone','home.siteJobsSub':'Photos & measurements from your phone','home.templateFourDoor':'Four Door Wardrobe','home.templateReady':'Ready for your saved checklist','home.templateThreeSliding':'Three Sliding Door Wardrobe','home.templatesHeading':'🗂️ My Templates','home.templatesSub':'Your customised library will live here.','home.unitCabinet':'cabinet','home.unitKitchen':'kitchen unit','home.unitLivingRoom':'living-room unit','home.unitOffice':'office unit','home.unitTvWall':'TV wall','home.unitUnderStairs':'under-stairs unit','home.unitWardrobeOrCabinet':'wardrobe or cabinet','home.viewAll':'View all','home.welcomeSubtitle':'Plan, design and manage your projects with ease.','home.welcomeTitle':'Welcome to AssembleOne Studio 👋','home.whatBuilding':'What are you building?',
  'parts.heading':'Panel Check','parts.subtitle':'Check every panel before making the cutting list.',
  'phoneScreen.heading':'Rooms guide','phoneScreen.part':'Part','phoneScreen.subtitle':'The selected panel is highlighted.',
  'qrScreen.generate':'Generate QR codes','qrScreen.heading':'QR labels — selected wardrobe only','qrScreen.print':'Print QR labels','qrScreen.smartQr':'Smart QR:','qrScreen.smartQrBody':'Scan inside AssembleOne to open the exact highlighted panel. When the mobile app has a public web address, paste it below and the normal phone camera can open the panel directly too.','qrScreen.subtitle':'QR codes from other jobs and wardrobes are kept separate.','qrScreen.webAddress':'Mobile app web address','qrScreen.webAddressHint':'Leave this empty while testing locally. Then scan with the scanner inside AssembleOne Mobile. The published project must already be opened on the phone or iPad.',
  'settingsScreen.appData':'App data','settingsScreen.appDataHint':'Remove all jobs, drawings and settings saved on this device. This cannot be undone.','settingsScreen.clearData':'Clear all data on this device','settingsScreen.cloudSync':'Cloud sync','settingsScreen.cloudSyncHint':'This device syncs with the phone app over the cloud automatically. No sign-in is required.','settingsScreen.heading':'Settings','settingsScreen.language':'Language','settingsScreen.languageHint':'Use the flag menu at the top of the screen to change the app language.','settingsScreen.subtitle':'App preferences and sync.','settingsScreen.unitCm':'Centimetres (cm)','settingsScreen.unitIn':'Inches (in)','settingsScreen.unitMm':'Millimetres (mm)','settingsScreen.units':'Measurement units','settingsScreen.unitsHint':'Choose how panel sizes are shown and typed in on the Drawing screen.',
  sitePlanner:'Site Planner','siteScreen.addFloorPlan':'Add a floor plan or site photo. Then choose a trade above and tap the plan.','siteScreen.addMeasurement':'↔ Measurement','siteScreen.addPlan':'Add / change site plan','siteScreen.addWorkStage':'+ Work stage','siteScreen.chooseTrade':'Choose a trade, then tap the exact place on the plan','siteScreen.chooseTradeMessage':'Choose a trade and send a project message.','siteScreen.pinHint':'The pin becomes a small conversation for everyone working at that point.','siteScreen.selectedPin':'Selected pin','siteScreen.showTrades':'Show trades','siteScreen.subtitle':'Put work, notes and conversations directly on the floor plan or site photo.','siteScreen.tapPin':'Tap a pin on the plan.','siteScreen.tapPinHint':'Tap a pin to read or reply. Tap an empty place after choosing a trade to add a new pin.','siteScreen.tradeMessages':'Trade messages','siteScreen.workOrder':'Work order',
  "partname.Adjustable shelf":"Adjustable shelf","partname.Appliance panel":"Appliance panel","partname.Back panel":"Back panel","partname.Base bottom":"Base bottom","partname.Base shelf":"Base shelf","partname.Base side":"Base side","partname.Base top":"Base top","partname.Batten":"Batten","partname.Bench top":"Bench top","partname.Book shelf":"Book shelf","partname.Bottom":"Bottom","partname.Bottom infill":"Bottom infill","partname.Bracket":"Bracket","partname.Cable panel":"Cable panel","partname.Centre divider":"Centre divider","partname.Cleat":"Cleat","partname.Clip":"Clip","partname.Cover panel":"Cover panel","partname.Custom panel":"Custom panel","partname.Desk side":"Desk side","partname.Desk top":"Desk top","partname.Dishwasher panel":"Dishwasher panel","partname.Divider":"Divider","partname.Door":"Door","partname.Drawer back":"Drawer back","partname.Drawer bottom":"Drawer bottom","partname.Drawer divider":"Drawer divider","partname.Drawer front":"Drawer front","partname.Drawer side":"Drawer side","partname.Drawer support":"Drawer support","partname.Dryer shelf":"Dryer shelf","partname.End panel":"End panel","partname.Filler panel":"Filler panel","partname.Fireplace panel":"Fireplace panel","partname.Fixed shelf":"Fixed shelf","partname.Fridge panel":"Fridge panel","partname.Glass shelf":"Glass shelf","partname.Handle":"Handle","partname.Hanging rail":"Hanging rail","partname.Hob rail":"Hob rail","partname.Infill":"Infill","partname.Kickboard":"Kickboard","partname.LED profile":"LED profile","partname.Left door":"Left door","partname.Left infill":"Left infill","partname.Left-hand side":"Left-hand side","partname.Light panel":"Light panel","partname.Mirror panel":"Mirror panel","partname.Modesty panel":"Modesty panel","partname.Oven rail":"Oven rail","partname.Pair of doors":"Pair of doors","partname.Plinth":"Plinth","partname.Pocket door":"Pocket door","partname.Printer shelf":"Printer shelf","partname.Right door":"Right door","partname.Right infill":"Right infill","partname.Right-hand side":"Right-hand side","partname.Scribe panel":"Scribe panel","partname.Seat top":"Seat top","partname.Shelf":"Shelf","partname.Side":"Side","partname.Side panel":"Side panel","partname.Sink rail":"Sink rail","partname.Slatted panel":"Slatted panel","partname.Sliding door":"Sliding door","partname.Speaker shelf":"Speaker shelf","partname.Splashback":"Splashback","partname.Support":"Support","partname.TV divider":"TV divider","partname.TV panel":"TV panel","partname.TV shelf":"TV shelf","partname.TV side":"TV side","partname.TV top":"TV top","partname.Tall cabinet side":"Tall cabinet side","partname.Toe kick":"Toe kick","partname.Top":"Top","partname.Top and bottom":"Top and bottom","partname.Top infill":"Top infill","partname.Utility shelf":"Utility shelf","partname.Wall cabinet bottom":"Wall cabinet bottom","partname.Wall cabinet side":"Wall cabinet side","partname.Wall cabinet top":"Wall cabinet top","partname.Wall shelf":"Wall shelf","partname.Washer shelf":"Washer shelf","partname.Wine shelf":"Wine shelf","partname.Worktop":"Worktop",
  'msg.noSitePicture':'No site picture is available.','msg.sitePhotoBesideDrawing':'The site photo is now beside the drawing tools as your reference.','msg.confirmDeleteWardrobe':'Delete this wardrobe and all its parts?','msg.openProjectFirst':'Open a project first.','msg.confirmDeleteRoomUnassigned':'Delete room "{0}"? The wardrobes will become unassigned.','msg.jobSaved':'Job saved.','msg.projectNotFound':'Project not found.','msg.enterCustomerName':'Enter a customer name.','msg.customerAlreadyExists':'"{0}" already exists.','msg.confirmDeleteCustomer':'Delete "{0}"?\n\nThis cannot be undone.','msg.confirmDeleteCustomerAndJobs':'Delete "{0}" and {1} job(s)?\n\nThis cannot be undone.','msg.siteUpdatesImported':'Site updates imported. Installation status, notes and photos are now back in Studio.','msg.notValidSiteUpdateZip':'This is not a valid AssembleOne site-update ZIP.','msg.confirmDeleteWithoutSaving':'Delete "{0}" without saving it anywhere?\n\nThis cannot be undone.','msg.siteJobNoLongerWaiting':'This site job is no longer waiting.','msg.savedToCustomerJobs':'Saved to {0}\'s jobs — find it anytime from My Projects.','msg.couldNotSaveJobTryDrawing':'Could not save this job. Please try Open Drawing instead.','msg.noNewSiteJobsWaiting':'No new site jobs are waiting.','msg.dropZipToReopen':'Drop an AssembleOne .zip job record to reopen it.','msg.siteJobOpenedDrawing':'Site job opened in Drawing. The measured photo is ready as your reference.','msg.directSyncNotAvailableBackup':'Direct sync is not available here. Use Open backup file.','msg.projectOpenedInStudio':'Project opened in AssembleOne Studio.','msg.notValidProjectZip':'This is not a valid AssembleOne project ZIP.','msg.choosePictureScreenshotPdf':'Please choose a picture, screenshot or PDF file.','msg.drawingTooLargeStorage':'The drawing is showing correctly, but it is too large for permanent browser storage. Keep this page open while working, or use a smaller screenshot.','msg.drawingCouldNotOpen':'The drawing could not be opened.','msg.notPictureFileTryDragging':'That item is not a picture file. Try dragging a PNG or JPG from your Downloads or Pictures folder.','msg.forMarkingPanelsUsePngJpg':'For marking panels, use a PNG or JPG screenshot of the PDF.','msg.confirmDeletePanel':'Delete {0}?','msg.markOrSelectPanelFirst':'Mark or select a panel first.','msg.markPanelFirst':'Mark a panel first.','msg.choosePanelFirst':'Choose a panel first.','msg.allMarkersAlreadyOnDrawing':'All {0} markers are already on the drawing.','msg.setQuantityFirst':'Set Quantity above 1 first, then use this to place a marker for every one at once.','msg.addedMoreMarkers':'Added {0} more marker(s) so all {1} are on the drawing. Drag each one to its real spot, then scan its own QR code once it\'s fitted.','msg.selectRepeatedMarkerFirst':'Select one of the repeated markers first.','msg.noCompletePartsReady':'No complete parts are ready. Add the part name, thickness, length and width first.','msg.confirmRemovePin':'Remove this pin?','msg.confirmRemoveLinkedGroupChat':'Remove this linked group chat?','msg.finishAllSectionsFirst':'Finish Start, Drawing, Panels, Cutting list and QR labels first. Each box will turn green when it is ready.','msg.dropValidFileTypes':'Drop a PNG, JPG, WEBP or PDF file here.','msg.printPreviewCouldNotOpen':'The print preview could not open. Please try again.','msg.noCompletePanelsToPrint':'No complete panels are ready to print.','msg.generateQrCodesFirst':'Generate QR codes first.','msg.openJobFirst':'Open a job first.','msg.nothingSentNoUnit':'Nothing was sent because this job has no unit yet.','msg.nothingSentNoPanels':'Nothing was sent because this job has no panels yet.','msg.confirmPanelsNotChecked':'{0} panel(s) not been checked yet (missing details or not reviewed). Send anyway?','msg.cuttingListSent':'Cutting list sent: {0} panels and {1} pieces.','msg.siteJobSent':'Site job sent: {0} room, {1} unit, {2} panels and {3} pieces.','msg.phoneConnectionFailed':'The phone connection failed. Check that both devices have internet and try again.','msg.typeNoteFirst':'Type a note first.','msg.confirmClearAllData':'This removes every job, drawing and setting saved on this device. This cannot be undone. Continue?','msg.addPanelBeforeTemplate':'Add at least one panel before saving a template.','msg.pleaseAddMissing':'Please add: {0}','msg.samePartNumberAdded':'The same part number has been added again. Drag the new marker to the matching panel.','msg.confirmDeleteJobBase':'Delete "{0}"?\n\nThis permanently deletes all wardrobes, drawings, panels, cutting lists, QR labels -- AND any photos or measurements saved for this job.','msg.confirmDeleteJobPhotos':'\n\nThis job has {0} photo(s) saved on it. They will be gone unless the phone still has them and you resend.','msg.confirmDeleteJobSibling':'\n\n⚠️ This looks like room {0} of {1} from the same site visit ({2}) -- make sure this is the one you actually want gone, not a room you mistook for a duplicate.','home.tagline':'Rooms · Cutting Lists · QR Panels','status.ready':'Ready','status.installed':'Installed','status.missing':'Missing','status.damaged':'Damaged','common.unnamedPart':'Unnamed part','common.notSet':'Not set','common.qty':'Qty','common.noPanelsMarked':'No panels marked yet.','common.material':'Material:','common.edging':'Edging:','common.notes':'Notes:','common.status':'Status:','common.choosePartName':'Choose part name','common.testQr':'Test QR','common.notTestedYet':'Not tested yet','common.noPartsInWardrobe':'No parts in this wardrobe.','common.markerXOfY':'marker {0} of {1}','common.doubleClickTickOff':'double-click to tick off','common.noCompleteComponentsYet':'No complete components yet. Finish the name and all measurements first.','step.start':'Start','step.drawing':'Drawing','step.panels':'Panels','step.cuttingList':'Cutting list','step.qrLabels':'QR labels','step.finish':'Finish','common.completeFirstFiveStages':'Complete the first five stages before sending the project','common.openThisSection':'Open this section','common.sendCompletedProjectPhone':'Send the completed project to phone or iPad','common.completeAllFiveStepsFirst':'Complete all five earlier steps first','common.readyToSend':'Ready to send','common.completeEveryStepFirst':'Complete every step first','common.completeSuffix':' complete','common.notCompleteSuffix':' not complete','common.openStepPrefix':'Open ','common.panelCheck':'Panel Check','trade.builder':'Builder','trade.bricklayer':'Bricklayer','trade.carpenter':'Carpenter','trade.electrician':'Electrician','trade.plumber':'Plumber','trade.decorator':'Decorator','trade.flooring':'Flooring','trade.wardrobes':'Wardrobes','trade.kitchenInstaller':'Kitchen Installer','trade.tiler':'Tiler','trade.hvac':'HVAC / Air Conditioning','trade.heating':'Heating','trade.windows':'Windows','trade.doors':'Doors','trade.roofer':'Roofer','trade.steelworker':'Steelworker','trade.landscaper':'Landscaper','trade.supplier':'Supplier','trade.client':'Client','trade.other':'Other','trade.measurement':'Measurement','common.move':'Move','common.done':'Done','common.delete':'Delete','common.messagePrefix':'Message ','common.tapPinOnPlan':'Tap a pin on the plan.','common.tradeLabel':'Trade','common.roomAreaLabel':'Room / area','common.bathroomExample':'Bathroom','common.statusLabel':'Status','common.pinStatusNew':'⚪ New','common.pinStatusWaiting':'🟡 Waiting','common.pinStatusDone':'🟢 Done','common.pinStatusProblem':'🔴 Problem','common.measurementTypeLabel':'Measurement type','common.wallToWall':'Wall to wall','common.measurementMmLabel':'Measurement (mm)','common.mainNoteLabel':'Main note','common.whatNeedsDoingPlaceholder':'What needs doing here?','common.photoLabel':'Photo','common.savePinBtn':'Save pin','common.deletePinBtn':'Delete pin','common.conversationAtPin':'Conversation at this pin','common.noRepliesYet':'No replies yet.','common.writeShortReplyPlaceholder':'Write a short reply…','common.sendBtn':'Send','common.dragTradePinToStart':'Drag one trade pin onto another to start a group chat.','common.reopen':'Reopen','common.markDone':'Mark done','common.deleteLink':'Delete link','common.noMessagesYet':'No messages yet.','common.writeShortMessagePlaceholder':'Write a short message…','common.stageWaiting':'Waiting','common.stageStarted':'Started','common.stageDelayed':'Delayed','common.stageReadyNext':'Ready for next trade','common.stageComplete':'Complete','common.addStagesHint':'Add stages only when you need an order of work.','common.tradeOrStagePrompt':'Trade or stage','common.noCustomersMatchSearch':'No customers match your search.','common.noCustomersYet':'No customers yet. Tap "+ New customer" to add one, or send a Site Job from your phone.','common.jobsCount':'{0} job(s)','common.openInMapsLink':'Open in Maps ›','common.openPinnedLocationMaps':'📍 Open pinned location in Maps ›','common.dragToTradeDbTitle':'Drag onto your trade database, the desktop, or another app to save a copy of this job','common.roomFallback':'Room','common.openArrowBtn':'Open ›','common.noJobsYetCustomer':'No jobs yet for this customer.','common.siblingRoomTag':'🔗 Room {0} of {1} from the same site visit — not a duplicate','common.customerNotNamed':'Customer not named','common.newSiteJob':'New site job','common.roomNotNamed':'Room not named','common.newBadge':'NEW','common.noNewJobsBadge':'No new jobs','common.noNewSiteJobsList':'No new site jobs','common.jobCouldNotBeRead':'⚠ Job could not be read','common.jobDataCorrupted':"This job's data is corrupted. Remove it so it doesn't block new jobs.",'common.remove':'Remove','common.removeWithoutOpening':'Remove without opening','common.saveToCustomer':'📁 Save to Customer','common.openDrawingArrow':'Open Drawing ›','common.useBackupFile':'Use backup file','common.directSyncUnavailableUseBackup':'Direct sync unavailable. Use the backup file.','common.couldNotAddDrawing':'Could not add drawing','common.roomsArea':'Rooms area','common.selectedFileCouldNotBeRead':'The selected file could not be read.','common.openingFileCancelled':'Opening the file was cancelled.','common.openingFileEllipsis':'Opening ','common.photoOrScreenshotFallback':'photo or screenshot','common.fileWasEmpty':'The file was empty.','common.tryAnotherPictureScreenshot':'Please try another picture or screenshot.','common.checkingClipboardForDrawing':'Checking the clipboard for a drawing…','common.drawingPastedFromClipboard':'Drawing pasted from the clipboard.','common.copyDrawingThenPasteHint':'Copy the drawing, then press Ctrl + V. The drawing box is ready.','common.installerNotesHeading':'Installer notes','common.accessOrderPlaceholder':'Access, order of work, sockets, skirting or other instructions','common.inThisRoomHeading':'In this room','common.panelsTapToRemove':'panels · tap to remove','common.noWardrobeCabinetYet':'No wardrobe or cabinet here yet.','common.addWardrobeCabinetHeading':'Add a wardrobe or cabinet','common.panelsWord':'panels','common.noUnassignedUnits':'No unassigned units. Add a wardrobe first or open another room.','common.renameRoomBtn':'Rename room','common.deleteRoomBtn':'Delete room','common.roomNamePrompt':'Room name:','common.wardrobeOrCabinetCount':'{0} wardrobe(s) or cabinet(s)','common.placeUnitsBtn':'Place {0} unit(s)','common.tapRoomAddUnit':'Tap a room, then add the unit','common.noRoomSelectedYet':'No room selected yet. Press Choose room and tap a picture.','roomType.kitchen':'Kitchen','roomType.livingRoom':'Living Room','roomType.tvWall':'TV Wall','roomType.masterBedroom':'Master Bedroom','roomType.bedroom':'Bedroom','roomType.kidsBedroom':'Kids Bedroom','roomType.dressingRoom':'Dressing Room','roomType.bathroom':'Bathroom','roomType.office':'Office','roomType.laundry':'Laundry','roomType.utilityRoom':'Utility Room','roomType.hallway':'Hallway','roomType.underStairs':'Under Stairs','roomType.wineRoom':'Wine Room','roomType.library':'Library','roomType.custom':'Custom','common.chooseRoomHeading':'Choose room','common.tapPictureRoomHelp':'Tap the picture for the room you are working in. You can add the same room type more than once.','common.typeRoomNamePlaceholder':'Type the room name','common.addRoomBtn':'Add room','common.editJobHeading':'Edit job','common.jobNameLabel':'Job name','common.customerLabel':'Customer','common.cancelBtn':'Cancel','common.saveBtn':'Save','common.createOrOpenJobNote':'Create a new job or open a saved job.','common.untitledJob':'Untitled job','common.addCustomer':'Add customer','common.editBtn':'Edit','common.chooseRoomBtn':'Choose Room','common.continueToDrawing':'➡ Continue to Drawing','common.openDrawingBtn':'Open drawing','common.roomsWord':'rooms','common.unitsWord':'units','common.materialsWord':'materials','common.piecesWord':'pieces','common.oneUnit':'1 unit','common.unitsCount':'{0} units','common.piecesCount':'{0} pieces','common.selectedRoomPrefix':'Selected room · ','common.noCustomerName':'No customer name','common.everythingReady':'Everything ready','common.checkRedCardsBeforeSending':'Check the red cards before sending','common.qrPanelsTitle':'QR Panels','common.projectNotesTitle':'Project Notes','common.roomsHeading':'Rooms','common.noRoomsYet':'No rooms yet.','common.panelsNeedMoreInfo':'⚠ {0} panel(s) need(s) more information before the cutting list.','common.noPanelsYetReturnDrawing':'No panels yet. Return to Drawing and mark the first panel.','common.panelsReadyCount':'{0} of {1} panels ready','common.longShortEdges':'{0} long edge(s) · {1} short edge(s)','common.measurementsLabel':'Measurements:','common.panelCheckedLabel':'Panel checked','common.panelNotCheckedLabel':'Panel not checked','common.doubleClickApprovePanel':'Double-click to approve this panel','common.doubleClickAfterChecking':'Double-click after checking this panel','common.buildChecklistHeading':'Build Checklist','common.hardwareChecklistHeading':'Hardware Checklist','common.tickedOffCount':'{0} of {1} ticked off','common.autoPickedUpHint':'Every panel you name on the drawing is picked up here automatically — no need to type it in.','common.addOwnElectricalPlaceholder':'Add your own, e.g. Electrical access panel','common.addOwnSoftClosePlaceholder':'Add your own, e.g. Soft-close dampers','common.addBtnPlus':'+ Add','common.useSavedTemplateHeading':'Use a saved template?','common.startFromPreviousHint':'Start this wardrobe from a previous panel list, or begin blank.','common.panelsHardwareCount':'{0} panel(s) · {1} hardware item(s)','common.startBlankBtn':'Start blank','common.saveAsTemplateHeading':'Save as template','common.templateNameLabel':'Template name','common.templateNamePlaceholder':'e.g. Two Door Wardrobe','common.saveTemplateBtn':'Save template','common.edgingConfirmationNeeded':'Edging and all details need confirmation','common.editPanelBtn':'Edit panel','hardware.hinges':'Hinges','hardware.handles':'Handles','hardware.shelfPins':'Shelf pins','hardware.ledLights':'LED lights','hardware.ledDriverTransformer':'LED driver / transformer','hardware.screwsFixings':'Screws & fixings','common.addedOnDrawing':'Added on drawing','common.panelSavedToast':'Panel saved','common.panelSavedNextReady':'Panel saved · Next panel ready','common.panelCouldNotBeSaved':'Panel could not be saved','common.addMainInfoHint':'Add the main information the installer should remember.','common.accessOrderSpecialPlaceholder':'Access, order of work, special instructions, lights or anything important','common.saveNotesBtn':'✓ Save notes','common.noWardrobeSelected':'No wardrobe selected.','common.noCompletePartsReadySupplier':'No complete parts are ready for the supplier. Add the name, thickness, length and width first.','common.partTypeCount':'{0} part type(s)','common.partNoHeader':'Part No.','common.panelDetailsHeader':'Panel details','common.descWhereGoesHeader':'Description / where it goes','common.noProjectSelected':'No project selected.','common.noImageDrawingAvailable':'No image drawing available.','common.partHeader':'Part','common.descriptionHeader':'Description','common.statusHeaderPlain':'Status','common.panelNotFound':'Panel not found','common.drawingMissingFor':'Drawing missing for {0}','common.openedOnDrawing':'{0} opened on the highlighted drawing','common.allowPopupsPrintQr':'Allow pop ups to print QR labels','common.qrCodesGenerated':'QR codes generated','nav.home':'Home','nav.customers':'Customers','nav.qrAndScan':'QR and Scan','nav.finishJob':'Finish Job','nav.settings':'Settings','drawing.saveToCustomer':'Save to Customer','jobs.newJobCustomerPrompt':'Customer name for this job?','drawing.enterCustomerNamePrompt':'Which customer is this job for?','common.savedToCustomerToast':'Saved to {0}'
 },
 es:{start:'Iniciar proyecto',startHelp:'Escribe el trabajo y elige lo que estás construyendo. Las habitaciones se guardan en el proyecto y se envían al teléfono.',job:'¿En qué estás trabajando?',summary:'Finalizar trabajo',summaryHelp:'Una última comprobación visual; después guarda o envía una nota al equipo de instalación.',finish:'Enviar al teléfono o iPad',noteLabel:'Nota para el teléfono',noteHint:'Se envía por separado, sin la lista de corte — útil para un mensaje rápido sobre este trabajo, en cualquier etapa.',notePlaceholder:'Ejemplo: Armario de Rojo — el cliente quiere bisagras de cierre suave, confirmar antes de instalar.',noteSendBtn:'Enviar nota al teléfono',noteSendSmall:'Solo esta nota, sin necesidad de lista de corte',
  'bom.pcsShort':'uds','bomScreen.deleteJob':'Eliminar este trabajo','bomScreen.saveProject':'Guardar proyecto','bomScreen.saveProjectSub':'Guarda todos los cambios de Studio','bomScreen.templateCheck':'Revisión de plantilla y herrajes','bomScreen.templateCheckSub':'Vuelve a comprobar paneles, bisagras, luces, rieles, cajones y herrajes antes de enviar.',
  'customers.addCustomer':'💾 Añadir cliente','customers.address':'Dirección','customers.backToCustomers':'← Clientes','customers.cancel':'Cancelar','customers.delete':'🗑 Eliminar','customers.edit':'✏️ Editar','customers.heading':'Clientes','customers.name':'Nombre','customers.newCustomer':'+ Nuevo cliente','customers.phone':'Teléfono','customers.save':'💾 Guardar','customers.searchPlaceholder':'Buscar clientes...','customers.subtitle':'Cada trabajo, guardado y organizado por cliente.',
  'drawing.back':'Atrás','drawing.catDoors':'Puertas y cajones','drawing.catInfills':'Rellenos','drawing.catKitchen':'Muebles de cocina','drawing.catTv':'Muebles y paredes de TV','drawing.catUtility':'Utilidad y piezas especiales','drawing.catWardrobes':'Armarios y muebles','drawing.checkAllPanels':'✓ Revisar todos los paneles','drawing.chooseDrawing':'Elegir dibujo','drawing.chosenParts':'Piezas elegidas','drawing.delete':'Eliminar','drawing.dropHere':'Suelta un dibujo, captura o foto aquí','drawing.dropHereHint':'Usa los botones de arriba, arrastra un dibujo a este recuadro, o pulsa Ctrl + V después de copiar una captura.','drawing.dropHereSub':'Pega, arrastra, elige un archivo o toma una foto.','drawing.edgeBandingTitle':'Doble clic para añadir cantos','drawing.edgeHelp':'Haz doble clic en el número de largo o ancho para añadir cantos: sin línea → una línea → doble línea.','drawing.fit':'Ajustar','drawing.fitDrawing':'Ajustar dibujo','drawing.leftRight':'Izquierda / Derecha','drawing.length':'Largo','drawing.makeUnique':'Hacer único el marcador seleccionado','drawing.materialChooseOnce':'Material — elige una vez para este trabajo','drawing.materialHint':'Escribe el nombre exacto del material usado en este trabajo.','drawing.materialPrefix':'Material','drawing.morePartNames':'Más nombres de piezas','drawing.noDrawing':'Sin dibujo','drawing.noPanelSelected':'Ningún panel seleccionado','drawing.notesHint':'Añade o usa otra nota','drawing.notesOptional':'Notas — opcional','drawing.notesPrefix':'Notas','drawing.panelOptions':'Opciones del panel','drawing.partName':'Nombre de la pieza','drawing.partNamePlaceholder':'Elige o escribe un nombre de pieza…','drawing.partSelected':'Pieza seleccionada','drawing.pasteDrawing':'Pegar dibujo','drawing.pasteTitle':'Pegar una captura o imagen copiada','drawing.putSameNumber':'+ Poner el mismo número en el dibujo','drawing.quantity':'Cantidad','drawing.samePanelMarkers':'Mismos marcadores de panel:','drawing.saveMaterial':'Guardar material','drawing.saveNext':'Guardar y siguiente','drawing.thickness':'Grosor','drawing.topBottom':'Superior / Inferior','drawing.width':'Ancho','drawing.zoomIn':'Acercar','drawing.zoomOut':'Alejar',
  'home.addLabel':'Añadir','home.addUnitBelow':'Añade la unidad correcta abajo.','home.addWardrobe':'+ Añadir armario o mueble','home.back':'← Atrás','home.back2':'Atrás','home.backHome':'← Inicio','home.chooseRoomHeading':'Elegir habitación','home.chooseRoomHint':'Toca un botón grande con imagen. La habitación se guarda dentro de este proyecto y se envía al teléfono automáticamente.','home.chooseRoomHint2':'Elige una habitación arriba, luego añade el mueble correcto para esa habitación.','home.continueJob':'Continuar trabajo actual','home.currentJobFallback':'Trabajo actual','home.customerLabel':'Cliente','home.customerPlaceholder':'Nombre del cliente','home.customersJobs':'Clientes y trabajos','home.customersJobsSub':'Ver todos los clientes y sus proyectos','home.jobNameHint':'Nombra el trabajo una vez, luego elige la habitación en la que estás trabajando.','home.jobNameLabel':'Nombre del trabajo','home.jobNamePlaceholder':'ej. Casa de Simone','home.newProject':'Nuevo proyecto','home.newProjectSub':'Empezar un nuevo cliente o proyecto','home.openJobHint':'Abre el trabajo en el que estás trabajando','home.recentJobs':'Trabajos recientes','home.recentJobsSub':'Tus trabajos abiertos recientemente','home.saveTemplateLater':'＋ Guardar una nueva plantilla más tarde','home.selectedRoomPrefix':'Habitación seleccionada:','home.siteJobs':'Trabajos de obra','home.siteJobsNew':'Nuevos trabajos enviados desde tu teléfono','home.siteJobsSub':'Fotos y medidas desde tu teléfono','home.templateFourDoor':'Armario de cuatro puertas','home.templateReady':'Listo para tu checklist guardado','home.templateThreeSliding':'Armario de tres puertas correderas','home.templatesHeading':'🗂️ Mis plantillas','home.templatesSub':'Tu biblioteca personalizada vivirá aquí.','home.unitCabinet':'mueble','home.unitKitchen':'mueble de cocina','home.unitLivingRoom':'mueble de salón','home.unitOffice':'mueble de oficina','home.unitTvWall':'pared de TV','home.unitUnderStairs':'mueble bajo escalera','home.unitWardrobeOrCabinet':'armario o mueble','home.viewAll':'Ver todo','home.welcomeSubtitle':'Planifica, diseña y gestiona tus proyectos con facilidad.','home.welcomeTitle':'Bienvenido a AssembleOne Studio 👋','home.whatBuilding':'¿Qué estás construyendo?',
  'parts.heading':'Revisión de paneles','parts.subtitle':'Revisa cada panel antes de hacer la lista de corte.',
  'phoneScreen.heading':'Guía de habitaciones','phoneScreen.part':'Pieza','phoneScreen.subtitle':'El panel seleccionado está resaltado.',
  'qrScreen.generate':'Generar códigos QR','qrScreen.heading':'Etiquetas QR — solo el armario seleccionado','qrScreen.print':'Imprimir etiquetas QR','qrScreen.smartQr':'QR inteligente:','qrScreen.smartQrBody':'Escanea dentro de AssembleOne para abrir exactamente el panel resaltado. Cuando la app móvil tenga una dirección web pública, pégala abajo y la cámara normal del teléfono también podrá abrir el panel directamente.','qrScreen.subtitle':'Los códigos QR de otros trabajos y armarios se mantienen separados.','qrScreen.webAddress':'Dirección web de la app móvil','qrScreen.webAddressHint':'Deja esto vacío mientras pruebas localmente. Luego escanea con el escáner dentro de AssembleOne Mobile. El proyecto publicado ya debe estar abierto en el teléfono o iPad.',
  'settingsScreen.appData':'Datos de la app','settingsScreen.appDataHint':'Elimina todos los trabajos, dibujos y ajustes guardados en este dispositivo. Esto no se puede deshacer.','settingsScreen.clearData':'Borrar todos los datos de este dispositivo','settingsScreen.cloudSync':'Sincronización en la nube','settingsScreen.cloudSyncHint':'Este dispositivo se sincroniza automáticamente con la app del teléfono a través de la nube. No se requiere inicio de sesión.','settingsScreen.heading':'Ajustes','settingsScreen.language':'Idioma','settingsScreen.languageHint':'Usa el menú de banderas en la parte superior de la pantalla para cambiar el idioma de la app.','settingsScreen.subtitle':'Preferencias de la app y sincronización.','settingsScreen.unitCm':'Centímetros (cm)','settingsScreen.unitIn':'Pulgadas (in)','settingsScreen.unitMm':'Milímetros (mm)','settingsScreen.units':'Unidades de medida','settingsScreen.unitsHint':'Elige cómo se muestran y se escriben los tamaños de panel en la pantalla de Dibujo.',
  sitePlanner:'Planificador de obra','siteScreen.addFloorPlan':'Añade un plano o foto de la obra. Luego elige un oficio arriba y toca el plano.','siteScreen.addMeasurement':'↔ Medida','siteScreen.addPlan':'Añadir / cambiar plano de obra','siteScreen.addWorkStage':'+ Etapa de trabajo','siteScreen.chooseTrade':'Elige un oficio, luego toca el lugar exacto en el plano','siteScreen.chooseTradeMessage':'Elige un oficio y envía un mensaje del proyecto.','siteScreen.pinHint':'El pin se convierte en una pequeña conversación para todos los que trabajan en ese punto.','siteScreen.selectedPin':'Pin seleccionado','siteScreen.showTrades':'Mostrar oficios','siteScreen.subtitle':'Pon trabajo, notas y conversaciones directamente en el plano o foto de la obra.','siteScreen.tapPin':'Toca un pin en el plano.','siteScreen.tapPinHint':'Toca un pin para leer o responder. Toca un lugar vacío después de elegir un oficio para añadir un nuevo pin.','siteScreen.tradeMessages':'Mensajes por oficio','siteScreen.workOrder':'Orden de trabajo',
  "partname.Adjustable shelf":"Estante ajustable","partname.Appliance panel":"Panel de electrodoméstico","partname.Back panel":"Panel trasero","partname.Base bottom":"Inferior base","partname.Base shelf":"Estante base","partname.Base side":"Lateral base","partname.Base top":"Superior base","partname.Batten":"Listón de madera","partname.Bench top":"Superior de banco","partname.Book shelf":"Estante de libros","partname.Bottom":"Inferior","partname.Bottom infill":"Relleno inferior","partname.Bracket":"Escuadra","partname.Cable panel":"Panel de cables","partname.Centre divider":"Divisor central","partname.Cleat":"Listón","partname.Clip":"Clip","partname.Cover panel":"Panel de cubierta","partname.Custom panel":"Panel personalizado","partname.Desk side":"Lateral de escritorio","partname.Desk top":"Superior de escritorio","partname.Dishwasher panel":"Panel de lavavajillas","partname.Divider":"Divisor","partname.Door":"Puerta","partname.Drawer back":"Trasera de cajón","partname.Drawer bottom":"Fondo de cajón","partname.Drawer divider":"Divisor de cajón","partname.Drawer front":"Frente de cajón","partname.Drawer side":"Lateral de cajón","partname.Drawer support":"Soporte de cajón","partname.Dryer shelf":"Estante de secadora","partname.End panel":"Panel final","partname.Filler panel":"Panel de relleno","partname.Fireplace panel":"Panel de chimenea","partname.Fixed shelf":"Estante fijo","partname.Fridge panel":"Panel de nevera","partname.Glass shelf":"Estante de cristal","partname.Handle":"Tirador","partname.Hanging rail":"Barra colgante","partname.Hob rail":"Riel de placa","partname.Infill":"Relleno","partname.Kickboard":"Rodapié","partname.LED profile":"Perfil LED","partname.Left door":"Puerta izquierda","partname.Left infill":"Relleno izquierdo","partname.Left-hand side":"Lado izquierdo","partname.Light panel":"Panel de luz","partname.Mirror panel":"Panel de espejo","partname.Modesty panel":"Panel de privacidad","partname.Oven rail":"Riel de horno","partname.Pair of doors":"Par de puertas","partname.Plinth":"Zócalo","partname.Pocket door":"Puerta corredera empotrada","partname.Printer shelf":"Estante de impresora","partname.Right door":"Puerta derecha","partname.Right infill":"Relleno derecho","partname.Right-hand side":"Lado derecho","partname.Scribe panel":"Panel de ajuste","partname.Seat top":"Superior de asiento","partname.Shelf":"Estante","partname.Side":"Lado","partname.Side panel":"Panel lateral","partname.Sink rail":"Riel de fregadero","partname.Slatted panel":"Panel de listones","partname.Sliding door":"Puerta corredera","partname.Speaker shelf":"Estante de altavoz","partname.Splashback":"Salpicadero","partname.Support":"Soporte","partname.TV divider":"Divisor de TV","partname.TV panel":"Panel de TV","partname.TV shelf":"Estante de TV","partname.TV side":"Lateral de TV","partname.TV top":"Superior de TV","partname.Tall cabinet side":"Lateral de armario alto","partname.Toe kick":"Zócalo inferior","partname.Top":"Superior","partname.Top and bottom":"Superior e inferior","partname.Top infill":"Relleno superior","partname.Utility shelf":"Estante de utilidad","partname.Wall cabinet bottom":"Inferior de armario superior","partname.Wall cabinet side":"Lateral de armario superior","partname.Wall cabinet top":"Superior de armario superior","partname.Wall shelf":"Estante de pared","partname.Washer shelf":"Estante de lavadora","partname.Wine shelf":"Estante de vinos","partname.Worktop":"Encimera",
  'msg.noSitePicture':'No hay ninguna foto del sitio disponible.','msg.sitePhotoBesideDrawing':'La foto del sitio está ahora junto a las herramientas de dibujo como referencia.','msg.confirmDeleteWardrobe':'¿Eliminar este armario y todas sus piezas?','msg.openProjectFirst':'Abre un proyecto primero.','msg.confirmDeleteRoomUnassigned':'¿Eliminar la habitación "{0}"? Los armarios quedarán sin asignar.','msg.jobSaved':'Trabajo guardado.','msg.projectNotFound':'Proyecto no encontrado.','msg.enterCustomerName':'Introduce el nombre del cliente.','msg.customerAlreadyExists':'"{0}" ya existe.','msg.confirmDeleteCustomer':'¿Eliminar "{0}"?\n\nEsto no se puede deshacer.','msg.confirmDeleteCustomerAndJobs':'¿Eliminar "{0}" y {1} trabajo(s)?\n\nEsto no se puede deshacer.','msg.siteUpdatesImported':'Actualizaciones del sitio importadas. El estado de instalación, las notas y las fotos ya están de vuelta en Studio.','msg.notValidSiteUpdateZip':'Esto no es un ZIP de actualización de sitio de AssembleOne válido.','msg.confirmDeleteWithoutSaving':'¿Eliminar "{0}" sin guardarlo en ningún sitio?\n\nEsto no se puede deshacer.','msg.siteJobNoLongerWaiting':'Este trabajo de sitio ya no está en espera.','msg.savedToCustomerJobs':'Guardado en los trabajos de {0} — encuéntralo cuando quieras desde Mis proyectos.','msg.couldNotSaveJobTryDrawing':'No se pudo guardar este trabajo. Prueba con Abrir dibujo en su lugar.','msg.noNewSiteJobsWaiting':'No hay nuevos trabajos de sitio en espera.','msg.dropZipToReopen':'Suelta un archivo .zip de trabajo de AssembleOne para reabrirlo.','msg.siteJobOpenedDrawing':'Trabajo de sitio abierto en Dibujo. La foto medida está lista como referencia.','msg.directSyncNotAvailableBackup':'La sincronización directa no está disponible aquí. Usa Abrir archivo de respaldo.','msg.projectOpenedInStudio':'Proyecto abierto en AssembleOne Studio.','msg.notValidProjectZip':'Esto no es un ZIP de proyecto de AssembleOne válido.','msg.choosePictureScreenshotPdf':'Elige una imagen, captura de pantalla o archivo PDF.','msg.drawingTooLargeStorage':'El dibujo se muestra correctamente, pero es demasiado grande para el almacenamiento permanente del navegador. Mantén esta página abierta mientras trabajas, o usa una captura más pequeña.','msg.drawingCouldNotOpen':'No se pudo abrir el dibujo.','msg.notPictureFileTryDragging':'Ese elemento no es un archivo de imagen. Prueba a arrastrar un PNG o JPG desde tu carpeta de Descargas o Imágenes.','msg.forMarkingPanelsUsePngJpg':'Para marcar paneles, usa una captura PNG o JPG del PDF.','msg.confirmDeletePanel':'¿Eliminar {0}?','msg.markOrSelectPanelFirst':'Marca o selecciona un panel primero.','msg.markPanelFirst':'Marca un panel primero.','msg.choosePanelFirst':'Elige un panel primero.','msg.allMarkersAlreadyOnDrawing':'Los {0} marcadores ya están en el dibujo.','msg.setQuantityFirst':'Pon la Cantidad por encima de 1 primero, y luego usa esto para colocar un marcador para cada uno a la vez.','msg.addedMoreMarkers':'Se añadieron {0} marcador(es) más, así que los {1} ya están en el dibujo. Arrastra cada uno a su lugar real, y luego escanea su propio código QR una vez instalado.','msg.selectRepeatedMarkerFirst':'Selecciona primero uno de los marcadores repetidos.','msg.noCompletePartsReady':'No hay piezas completas listas. Añade primero el nombre de la pieza, el grosor, el largo y el ancho.','msg.confirmRemovePin':'¿Quitar este pin?','msg.confirmRemoveLinkedGroupChat':'¿Quitar este chat de grupo vinculado?','msg.finishAllSectionsFirst':'Termina primero Inicio, Dibujo, Paneles, Lista de corte y Etiquetas QR. Cada casilla se pondrá verde cuando esté lista.','msg.dropValidFileTypes':'Suelta aquí un archivo PNG, JPG, WEBP o PDF.','msg.printPreviewCouldNotOpen':'La vista previa de impresión no se pudo abrir. Inténtalo de nuevo.','msg.noCompletePanelsToPrint':'No hay paneles completos listos para imprimir.','msg.generateQrCodesFirst':'Genera primero los códigos QR.','msg.openJobFirst':'Abre un trabajo primero.','msg.nothingSentNoUnit':'No se envió nada porque este trabajo aún no tiene ninguna unidad.','msg.nothingSentNoPanels':'No se envió nada porque este trabajo aún no tiene paneles.','msg.confirmPanelsNotChecked':'{0} panel(es) aún no se han revisado (faltan detalles o no se han comprobado). ¿Enviar de todos modos?','msg.cuttingListSent':'Lista de corte enviada: {0} paneles y {1} piezas.','msg.siteJobSent':'Trabajo de sitio enviado: {0} habitación, {1} unidad, {2} paneles y {3} piezas.','msg.phoneConnectionFailed':'La conexión con el teléfono falló. Comprueba que ambos dispositivos tienen internet e inténtalo de nuevo.','msg.typeNoteFirst':'Escribe una nota primero.','msg.confirmClearAllData':'Esto elimina todos los trabajos, dibujos y ajustes guardados en este dispositivo. Esto no se puede deshacer. ¿Continuar?','msg.addPanelBeforeTemplate':'Añade al menos un panel antes de guardar una plantilla.','msg.pleaseAddMissing':'Por favor añade: {0}','msg.samePartNumberAdded':'Se ha añadido de nuevo el mismo número de pieza. Arrastra el nuevo marcador hasta el panel correspondiente.','msg.confirmDeleteJobBase':'¿Eliminar "{0}"?\n\nEsto elimina permanentemente todos los armarios, dibujos, paneles, listas de corte, etiquetas QR -- Y cualquier foto o medición guardada para este trabajo.','msg.confirmDeleteJobPhotos':'\n\nEste trabajo tiene {0} foto(s) guardada(s). Se perderán a menos que el teléfono todavía las tenga y las reenvíes.','msg.confirmDeleteJobSibling':'\n\n⚠️ Esto parece ser la habitación {0} de {1} de la misma visita al sitio ({2}) -- asegúrate de que esta es la que realmente quieres eliminar, no una habitación que confundiste con un duplicado.','home.tagline':'Habitaciones · Listas de corte · Paneles QR','status.ready':'Listo','status.installed':'Instalado','status.missing':'Falta','status.damaged':'Dañado','common.unnamedPart':'Pieza sin nombre','common.notSet':'No definido','common.qty':'Cant.','common.noPanelsMarked':'Aún no hay paneles marcados.','common.material':'Material:','common.edging':'Cantos:','common.notes':'Notas:','common.status':'Estado:','common.choosePartName':'Elige el nombre de la pieza','common.testQr':'Probar QR','common.notTestedYet':'Aún no probado','common.noPartsInWardrobe':'No hay piezas en este armario.','common.markerXOfY':'marcador {0} de {1}','common.doubleClickTickOff':'doble clic para marcar como hecho','common.noCompleteComponentsYet':'Aún no hay componentes completos. Termina primero el nombre y todas las medidas.','step.start':'Inicio','step.drawing':'Dibujo','step.panels':'Paneles','step.cuttingList':'Lista de corte','step.qrLabels':'Etiquetas QR','step.finish':'Finalizar','common.completeFirstFiveStages':'Completa las primeras cinco etapas antes de enviar el proyecto','common.openThisSection':'Abrir esta sección','common.sendCompletedProjectPhone':'Enviar el proyecto terminado al teléfono o iPad','common.completeAllFiveStepsFirst':'Completa primero los cinco pasos anteriores','common.readyToSend':'Listo para enviar','common.completeEveryStepFirst':'Completa primero todos los pasos','common.completeSuffix':' completo','common.notCompleteSuffix':' no completo','common.openStepPrefix':'Abrir ','common.panelCheck':'Revisión de paneles','trade.builder':'Constructor','trade.bricklayer':'Albañil','trade.carpenter':'Carpintero','trade.electrician':'Electricista','trade.plumber':'Fontanero','trade.decorator':'Pintor','trade.flooring':'Suelos','trade.wardrobes':'Armarios','trade.kitchenInstaller':'Instalador de cocinas','trade.tiler':'Alicatador','trade.hvac':'Climatización','trade.heating':'Calefacción','trade.windows':'Ventanas','trade.doors':'Puertas','trade.roofer':'Techador','trade.steelworker':'Estructuras metálicas','trade.landscaper':'Jardinero','trade.supplier':'Proveedor','trade.client':'Cliente','trade.other':'Otro','trade.measurement':'Medición','common.move':'Mover','common.done':'Hecho','common.delete':'Eliminar','common.messagePrefix':'Mensaje a ','common.tapPinOnPlan':'Toca una chincheta en el plano.','common.tradeLabel':'Oficio','common.roomAreaLabel':'Habitación / zona','common.bathroomExample':'Baño','common.statusLabel':'Estado','common.pinStatusNew':'⚪ Nuevo','common.pinStatusWaiting':'🟡 Esperando','common.pinStatusDone':'🟢 Hecho','common.pinStatusProblem':'🔴 Problema','common.measurementTypeLabel':'Tipo de medición','common.wallToWall':'Pared a pared','common.measurementMmLabel':'Medición (mm)','common.mainNoteLabel':'Nota principal','common.whatNeedsDoingPlaceholder':'¿Qué hay que hacer aquí?','common.photoLabel':'Foto','common.savePinBtn':'Guardar pin','common.deletePinBtn':'Eliminar pin','common.conversationAtPin':'Conversación en este pin','common.noRepliesYet':'Aún no hay respuestas.','common.writeShortReplyPlaceholder':'Escribe una respuesta breve…','common.sendBtn':'Enviar','common.dragTradePinToStart':'Arrastra un pin de oficio sobre otro para iniciar un chat de grupo.','common.reopen':'Reabrir','common.markDone':'Marcar como hecho','common.deleteLink':'Eliminar enlace','common.noMessagesYet':'Aún no hay mensajes.','common.writeShortMessagePlaceholder':'Escribe un mensaje breve…','common.stageWaiting':'Esperando','common.stageStarted':'Iniciado','common.stageDelayed':'Retrasado','common.stageReadyNext':'Listo para el siguiente oficio','common.stageComplete':'Completado','common.addStagesHint':'Añade etapas solo cuando necesites un orden de trabajo.','common.tradeOrStagePrompt':'Oficio o etapa','common.noCustomersMatchSearch':'No hay clientes que coincidan con tu búsqueda.','common.noCustomersYet':'Aún no hay clientes. Toca "+ Nuevo cliente" para añadir uno, o envía un Trabajo de obra desde tu teléfono.','common.jobsCount':'{0} trabajo(s)','common.openInMapsLink':'Abrir en Maps ›','common.openPinnedLocationMaps':'📍 Abrir ubicación fijada en Maps ›','common.dragToTradeDbTitle':'Arrastra a tu base de datos de oficios, al escritorio o a otra aplicación para guardar una copia de este trabajo','common.roomFallback':'Habitación','common.openArrowBtn':'Abrir ›','common.noJobsYetCustomer':'Aún no hay trabajos para este cliente.','common.siblingRoomTag':'🔗 Habitación {0} de {1} de la misma visita a la obra — no es un duplicado','common.customerNotNamed':'Cliente sin nombre','common.newSiteJob':'Nuevo trabajo de obra','common.roomNotNamed':'Habitación sin nombre','common.newBadge':'NUEVO','common.noNewJobsBadge':'Sin trabajos nuevos','common.noNewSiteJobsList':'No hay trabajos de obra nuevos','common.jobCouldNotBeRead':'⚠ No se pudo leer el trabajo','common.jobDataCorrupted':'Los datos de este trabajo están dañados. Elimínalo para que no bloquee trabajos nuevos.','common.remove':'Eliminar','common.removeWithoutOpening':'Eliminar sin abrir','common.saveToCustomer':'📁 Guardar en Cliente','common.openDrawingArrow':'Abrir dibujo ›','common.useBackupFile':'Usar archivo de respaldo','common.directSyncUnavailableUseBackup':'Sincronización directa no disponible. Usa el archivo de respaldo.','common.couldNotAddDrawing':'No se pudo añadir el dibujo','common.roomsArea':'Zona de habitaciones','common.selectedFileCouldNotBeRead':'No se pudo leer el archivo seleccionado.','common.openingFileCancelled':'Se canceló la apertura del archivo.','common.openingFileEllipsis':'Abriendo ','common.photoOrScreenshotFallback':'foto o captura de pantalla','common.fileWasEmpty':'El archivo estaba vacío.','common.tryAnotherPictureScreenshot':'Prueba con otra imagen o captura de pantalla.','common.checkingClipboardForDrawing':'Comprobando el portapapeles en busca de un dibujo…','common.drawingPastedFromClipboard':'Dibujo pegado desde el portapapeles.','common.copyDrawingThenPasteHint':'Copia el dibujo y luego pulsa Ctrl + V. El cuadro de dibujo está listo.','common.installerNotesHeading':'Notas para el instalador','common.accessOrderPlaceholder':'Acceso, orden de trabajo, enchufes, rodapiés u otras instrucciones','common.inThisRoomHeading':'En esta habitación','common.panelsTapToRemove':'paneles · toca para quitar','common.noWardrobeCabinetYet':'Aún no hay ningún armario aquí.','common.addWardrobeCabinetHeading':'Añadir un armario','common.panelsWord':'paneles','common.noUnassignedUnits':'No hay unidades sin asignar. Añade primero un armario o abre otra habitación.','common.renameRoomBtn':'Renombrar habitación','common.deleteRoomBtn':'Eliminar habitación','common.roomNamePrompt':'Nombre de la habitación:','common.wardrobeOrCabinetCount':'{0} armario(s)','common.placeUnitsBtn':'Colocar {0} unidad(es)','common.tapRoomAddUnit':'Toca una habitación y luego añade la unidad','common.noRoomSelectedYet':'Aún no se ha seleccionado ninguna habitación. Pulsa Elegir habitación y toca una imagen.','roomType.kitchen':'Cocina','roomType.livingRoom':'Salón','roomType.tvWall':'Pared de TV','roomType.masterBedroom':'Dormitorio principal','roomType.bedroom':'Dormitorio','roomType.kidsBedroom':'Dormitorio infantil','roomType.dressingRoom':'Vestidor','roomType.bathroom':'Baño','roomType.office':'Oficina','roomType.laundry':'Lavandería','roomType.utilityRoom':'Cuarto de servicio','roomType.hallway':'Pasillo','roomType.underStairs':'Bajo escalera','roomType.wineRoom':'Bodega','roomType.library':'Biblioteca','roomType.custom':'Personalizado','common.chooseRoomHeading':'Elige habitación','common.tapPictureRoomHelp':'Toca la imagen de la habitación en la que estás trabajando. Puedes añadir el mismo tipo de habitación más de una vez.','common.typeRoomNamePlaceholder':'Escribe el nombre de la habitación','common.addRoomBtn':'Añadir habitación','common.editJobHeading':'Editar trabajo','common.jobNameLabel':'Nombre del trabajo','common.customerLabel':'Cliente','common.cancelBtn':'Cancelar','common.saveBtn':'Guardar','common.createOrOpenJobNote':'Crea un trabajo nuevo o abre uno guardado.','common.untitledJob':'Trabajo sin título','common.addCustomer':'Añadir cliente','common.editBtn':'Editar','common.chooseRoomBtn':'Elegir habitación','common.continueToDrawing':'➡ Continuar al dibujo','common.openDrawingBtn':'Abrir dibujo','common.roomsWord':'habitaciones','common.unitsWord':'unidades','common.materialsWord':'materiales','common.piecesWord':'piezas','common.oneUnit':'1 unidad','common.unitsCount':'{0} unidades','common.piecesCount':'{0} piezas','common.selectedRoomPrefix':'Habitación seleccionada · ','common.noCustomerName':'Sin nombre de cliente','common.everythingReady':'Todo listo','common.checkRedCardsBeforeSending':'Revisa las tarjetas rojas antes de enviar','common.qrPanelsTitle':'Paneles QR','common.projectNotesTitle':'Notas del proyecto','common.roomsHeading':'Habitaciones','common.noRoomsYet':'Aún no hay habitaciones.','common.panelsNeedMoreInfo':'⚠ {0} panel(es) necesita(n) más información antes de la lista de corte.','common.noPanelsYetReturnDrawing':'Aún no hay paneles. Vuelve a Dibujo y marca el primer panel.','common.panelsReadyCount':'{0} de {1} paneles listos','common.longShortEdges':'{0} canto(s) largo(s) · {1} canto(s) corto(s)','common.measurementsLabel':'Medidas:','common.panelCheckedLabel':'Panel verificado','common.panelNotCheckedLabel':'Panel no verificado','common.doubleClickApprovePanel':'Doble clic para aprobar este panel','common.doubleClickAfterChecking':'Doble clic después de comprobar este panel','common.buildChecklistHeading':'Lista de montaje','common.hardwareChecklistHeading':'Lista de herrajes','common.tickedOffCount':'{0} de {1} marcados','common.autoPickedUpHint':'Cada panel que nombres en el dibujo aparece aquí automáticamente — no hace falta escribirlo.','common.addOwnElectricalPlaceholder':'Añade el tuyo, p. ej. Panel de acceso eléctrico','common.addOwnSoftClosePlaceholder':'Añade el tuyo, p. ej. Amortiguadores soft-close','common.addBtnPlus':'+ Añadir','common.useSavedTemplateHeading':'¿Usar una plantilla guardada?','common.startFromPreviousHint':'Comienza este armario a partir de una lista de paneles anterior, o empieza en blanco.','common.panelsHardwareCount':'{0} panel(es) · {1} herraje(s)','common.startBlankBtn':'Empezar en blanco','common.saveAsTemplateHeading':'Guardar como plantilla','common.templateNameLabel':'Nombre de la plantilla','common.templateNamePlaceholder':'p. ej. Armario de dos puertas','common.saveTemplateBtn':'Guardar plantilla','common.edgingConfirmationNeeded':'El canteado y todos los detalles necesitan confirmación','common.editPanelBtn':'Editar panel','hardware.hinges':'Bisagras','hardware.handles':'Tiradores','hardware.shelfPins':'Soportes de estante','hardware.ledLights':'Luces LED','hardware.ledDriverTransformer':'Driver/transformador LED','hardware.screwsFixings':'Tornillos y fijaciones','common.addedOnDrawing':'Añadido en el dibujo','common.panelSavedToast':'Panel guardado','common.panelSavedNextReady':'Panel guardado · Siguiente panel listo','common.panelCouldNotBeSaved':'No se pudo guardar el panel','common.addMainInfoHint':'Añade la información principal que el instalador debe recordar.','common.accessOrderSpecialPlaceholder':'Acceso, orden de trabajo, instrucciones especiales, luces o cualquier cosa importante','common.saveNotesBtn':'✓ Guardar notas','common.noWardrobeSelected':'Ningún armario seleccionado.','common.noCompletePartsReadySupplier':'No hay piezas completas listas para el proveedor. Añade primero el nombre, el grosor, la longitud y el ancho.','common.partTypeCount':'{0} tipo(s) de pieza','common.partNoHeader':'N.º de pieza','common.panelDetailsHeader':'Detalles del panel','common.descWhereGoesHeader':'Descripción / dónde va','common.noProjectSelected':'Ningún proyecto seleccionado.','common.noImageDrawingAvailable':'No hay ningún dibujo de imagen disponible.','common.partHeader':'Pieza','common.descriptionHeader':'Descripción','common.statusHeaderPlain':'Estado','common.panelNotFound':'Panel no encontrado','common.drawingMissingFor':'Falta el dibujo de {0}','common.openedOnDrawing':'{0} abierto en el dibujo resaltado','common.allowPopupsPrintQr':'Permite las ventanas emergentes para imprimir etiquetas QR','common.qrCodesGenerated':'Códigos QR generados','nav.home':'Inicio','nav.customers':'Clientes','nav.qrAndScan':'QR y escaneo','nav.finishJob':'Finalizar trabajo','nav.settings':'Ajustes','drawing.saveToCustomer':'Guardar en el cliente','jobs.newJobCustomerPrompt':'¿Nombre del cliente para este trabajo?','drawing.enterCustomerNamePrompt':'¿Para qué cliente es este trabajo?','common.savedToCustomerToast':'Guardado en {0}'
 },
 da:{start:'Start projekt',startHelp:'Skriv jobbet og vælg, hvad du bygger. Rum gemmes i projektet og sendes automatisk til telefonen.',job:'Hvad arbejder du på?',summary:'Afslut job',summaryHelp:'Et sidste visuelt tjek, og gem eller send derefter en note til installationsteamet.',finish:'Send til telefon eller iPad',noteLabel:'Note til telefonen',noteHint:'Sendes for sig selv, adskilt fra skærelisten — god til en hurtig besked om dette job, uanset stadie.',notePlaceholder:'Eksempel: Reds garderobeskab — kunden vil have soft-close hængsler, bekræft før montering.',noteSendBtn:'Send note til telefonen',noteSendSmall:'Kun denne note, ingen skæreliste nødvendig',
  'bom.pcsShort':'stk','bomScreen.deleteJob':'Slet dette job','bomScreen.saveProject':'Gem projekt','bomScreen.saveProjectSub':'Behold alle Studio-ændringer','bomScreen.templateCheck':'Skabelon- og beslagtjek','bomScreen.templateCheckSub':'Dobbelttjek paneler, hængsler, lys, skinner, skuffer og beslag før afsendelse.',
  'customers.addCustomer':'💾 Tilføj kunde','customers.address':'Adresse','customers.backToCustomers':'← Kunder','customers.cancel':'Annuller','customers.delete':'🗑 Slet','customers.edit':'✏️ Rediger','customers.heading':'Kunder','customers.name':'Navn','customers.newCustomer':'+ Ny kunde','customers.phone':'Telefon','customers.save':'💾 Gem','customers.searchPlaceholder':'Søg kunder...','customers.subtitle':'Hvert job, gemt og organiseret efter kunde.',
  'drawing.back':'Tilbage','drawing.catDoors':'Døre og skuffer','drawing.catInfills':'Udfyldninger','drawing.catKitchen':'Køkkenskabe','drawing.catTv':'TV-vægge og møbler','drawing.catUtility':'Bryggers og specialdele','drawing.catWardrobes':'Garderobeskabe og skabe','drawing.checkAllPanels':'✓ Tjek alle paneler','drawing.chooseDrawing':'Vælg tegning','drawing.chosenParts':'Valgte dele','drawing.delete':'Slet','drawing.dropHere':'Slip en tegning, screenshot eller foto her','drawing.dropHereHint':'Brug knapperne ovenfor, træk en tegning ind i boksen, eller tryk Ctrl + V efter kopiering af et screenshot.','drawing.dropHereSub':'Indsæt, slip, vælg en fil eller tag et foto.','drawing.edgeBandingTitle':'Dobbeltklik for at tilføje kantliste','drawing.edgeHelp':'Dobbeltklik på længde- eller breddetallet for at tilføje kantliste: ingen linje → en linje → dobbelt linje.','drawing.fit':'Tilpas','drawing.fitDrawing':'Tilpas tegning','drawing.leftRight':'Venstre / Højre','drawing.length':'Længde','drawing.makeUnique':'Gør valgte markør unik','drawing.materialChooseOnce':'Materiale — vælg én gang for dette job','drawing.materialHint':'Skriv det nøjagtige materialenavn brugt til dette job.','drawing.materialPrefix':'Materiale','drawing.morePartNames':'Flere delenavne','drawing.noDrawing':'Ingen tegning','drawing.noPanelSelected':'Intet panel valgt','drawing.notesHint':'Tilføj eller brug en anden note','drawing.notesOptional':'Noter — valgfrit','drawing.notesPrefix':'Noter','drawing.panelOptions':'Panelindstillinger','drawing.partName':'Delnavn','drawing.partNamePlaceholder':'Vælg eller skriv et delnavn…','drawing.partSelected':'Del valgt','drawing.pasteDrawing':'Indsæt tegning','drawing.pasteTitle':'Indsæt et kopieret screenshot eller billede','drawing.putSameNumber':'+ Sæt samme nummer på tegningen','drawing.quantity':'Antal','drawing.samePanelMarkers':'Samme panelmarkører:','drawing.saveMaterial':'Gem materiale','drawing.saveNext':'Gem og næste','drawing.thickness':'Tykkelse','drawing.topBottom':'Top / Bund','drawing.width':'Bredde','drawing.zoomIn':'Zoom ind','drawing.zoomOut':'Zoom ud',
  'home.addLabel':'Tilføj','home.addUnitBelow':'Tilføj den rigtige enhed nedenfor.','home.addWardrobe':'+ Tilføj garderobeskab eller skab','home.back':'← Tilbage','home.back2':'Tilbage','home.backHome':'← Hjem','home.chooseRoomHeading':'Vælg rum','home.chooseRoomHint':'Tryk på en stor billedknap. Rummet gemmes i projektet og sendes automatisk til telefonen.','home.chooseRoomHint2':'Vælg et rum ovenfor, tilføj derefter det rigtige møbel til det rum.','home.continueJob':'Fortsæt aktuelt job','home.currentJobFallback':'Aktuelt job','home.customerLabel':'Kunde','home.customerPlaceholder':'Kundenavn','home.customersJobs':'Kunder og job','home.customersJobsSub':'Se alle kunder og deres projekter','home.jobNameHint':'Navngiv jobbet én gang, vælg derefter det rum du arbejder i.','home.jobNameLabel':'Jobnavn','home.jobNamePlaceholder':'f.eks. Simones hus','home.newProject':'Nyt projekt','home.newProjectSub':'Start en ny kunde eller projekt','home.openJobHint':'Åbn det job du arbejder på','home.recentJobs':'Seneste job','home.recentJobsSub':'Dine senest åbnede job','home.saveTemplateLater':'＋ Gem en ny skabelon senere','home.selectedRoomPrefix':'Valgt rum:','home.siteJobs':'Byggepladsjob','home.siteJobsNew':'Nye job sendt fra din telefon','home.siteJobsSub':'Fotos og mål fra din telefon','home.templateFourDoor':'Garderobeskab med fire låger','home.templateReady':'Klar til din gemte tjekliste','home.templateThreeSliding':'Garderobeskab med tre skydelåger','home.templatesHeading':'🗂️ Mine skabeloner','home.templatesSub':'Dit tilpassede bibliotek vil bo her.','home.unitCabinet':'skab','home.unitKitchen':'køkkenenhed','home.unitLivingRoom':'stueenhed','home.unitOffice':'kontorenhed','home.unitTvWall':'TV-væg','home.unitUnderStairs':'enhed under trappen','home.unitWardrobeOrCabinet':'garderobeskab eller skab','home.viewAll':'Se alle','home.welcomeSubtitle':'Planlæg, design og administrer dine projekter med lethed.','home.welcomeTitle':'Velkommen til AssembleOne Studio 👋','home.whatBuilding':'Hvad bygger du?',
  'parts.heading':'Paneltjek','parts.subtitle':'Tjek hvert panel før du laver skærelisten.',
  'phoneScreen.heading':'Rumguide','phoneScreen.part':'Del','phoneScreen.subtitle':'Det valgte panel er fremhævet.',
  'qrScreen.generate':'Generer QR-koder','qrScreen.heading':'QR-mærkater — kun valgt skab','qrScreen.print':'Udskriv QR-mærkater','qrScreen.smartQr':'Smart QR:','qrScreen.smartQrBody':'Scan inde i AssembleOne for at åbne det præcise fremhævede panel. Når mobilappen har en offentlig webadresse, indsæt den nedenfor, og det normale telefonkamera kan også åbne panelet direkte.','qrScreen.subtitle':'QR-koder fra andre job og skabe holdes adskilt.','qrScreen.webAddress':'Mobilapp webadresse','qrScreen.webAddressHint':'Lad dette være tomt under lokal test. Scan derefter med scanneren inde i AssembleOne Mobile. Det udgivne projekt skal allerede være åbnet på telefonen eller iPad.',
  'settingsScreen.appData':'Appdata','settingsScreen.appDataHint':'Fjern alle job, tegninger og indstillinger gemt på denne enhed. Dette kan ikke fortrydes.','settingsScreen.clearData':'Ryd alle data på denne enhed','settingsScreen.cloudSync':'Cloud-synkronisering','settingsScreen.cloudSyncHint':'Denne enhed synkroniserer automatisk med telefonappen via skyen. Ingen login er nødvendig.','settingsScreen.heading':'Indstillinger','settingsScreen.language':'Sprog','settingsScreen.languageHint':'Brug flagmenuen øverst på skærmen til at skifte appens sprog.','settingsScreen.subtitle':'Appindstillinger og synkronisering.','settingsScreen.unitCm':'Centimeter (cm)','settingsScreen.unitIn':'Tommer (in)','settingsScreen.unitMm':'Millimeter (mm)','settingsScreen.units':'Måleenheder','settingsScreen.unitsHint':'Vælg hvordan panelstørrelser vises og indtastes på tegneskærmen.',
  sitePlanner:'Byggepladsplan','siteScreen.addFloorPlan':'Tilføj en plantegning eller et byggepladsfoto. Vælg derefter et fag ovenfor og tryk på planen.','siteScreen.addMeasurement':'↔ Mål','siteScreen.addPlan':'Tilføj / skift byggepladsplan','siteScreen.addWorkStage':'+ Arbejdsfase','siteScreen.chooseTrade':'Vælg et fag, tryk derefter på det præcise sted på planen','siteScreen.chooseTradeMessage':'Vælg et fag og send en projektbesked.','siteScreen.pinHint':'Nålen bliver en lille samtale for alle der arbejder på det sted.','siteScreen.selectedPin':'Valgt nål','siteScreen.showTrades':'Vis fag','siteScreen.subtitle':'Sæt arbejde, noter og samtaler direkte på plantegningen eller byggepladsfotoet.','siteScreen.tapPin':'Tryk på en nål på planen.','siteScreen.tapPinHint':'Tryk på en nål for at læse eller svare. Tryk på et tomt sted efter at have valgt et fag for at tilføje en ny nål.','siteScreen.tradeMessages':'Fagbeskeder','siteScreen.workOrder':'Arbejdsordre',
  "partname.Adjustable shelf":"Justerbar hylde","partname.Appliance panel":"Apparatpanel","partname.Back panel":"Bagpanel","partname.Base bottom":"Underskabsbund","partname.Base shelf":"Underskabshylde","partname.Base side":"Underskabsside","partname.Base top":"Underskabstop","partname.Batten":"Træliste","partname.Bench top":"Bænkeplade","partname.Book shelf":"Boghylde","partname.Bottom":"Bund","partname.Bottom infill":"Bund udfyldning","partname.Bracket":"Konsol","partname.Cable panel":"Kabelpanel","partname.Centre divider":"Midterskillevæg","partname.Cleat":"Liste","partname.Clip":"Clips","partname.Cover panel":"Dækpanel","partname.Custom panel":"Brugerdefineret panel","partname.Desk side":"Skrivebordsside","partname.Desk top":"Skrivebordsplade","partname.Dishwasher panel":"Opvaskepanel","partname.Divider":"Skillevæg","partname.Door":"Låge","partname.Drawer back":"Skuffebagside","partname.Drawer bottom":"Skuffebund","partname.Drawer divider":"Skilleskuffe","partname.Drawer front":"Skuffefront","partname.Drawer side":"Skuffeside","partname.Drawer support":"Skuffestøtte","partname.Dryer shelf":"Tørretumblerhylde","partname.End panel":"Endepanel","partname.Filler panel":"Fyldpanel","partname.Fireplace panel":"Pejsepanel","partname.Fixed shelf":"Fast hylde","partname.Fridge panel":"Køleskabspanel","partname.Glass shelf":"Glashylde","partname.Handle":"Håndtag","partname.Hanging rail":"Hængeskinne","partname.Hob rail":"Kogepladeskinne","partname.Infill":"Udfyldning","partname.Kickboard":"Fodpanel","partname.LED profile":"LED-profil","partname.Left door":"Venstre låge","partname.Left infill":"Venstre udfyldning","partname.Left-hand side":"Venstre side","partname.Light panel":"Lyspanel","partname.Mirror panel":"Spejlpanel","partname.Modesty panel":"Fodpanel skrivebord","partname.Oven rail":"Ovnskinne","partname.Pair of doors":"Par låger","partname.Plinth":"Sokkel","partname.Pocket door":"Skydedør i væg","partname.Printer shelf":"Printerhylde","partname.Right door":"Højre låge","partname.Right infill":"Højre udfyldning","partname.Right-hand side":"Højre side","partname.Scribe panel":"Tilpasningspanel","partname.Seat top":"Sædeplade","partname.Shelf":"Hylde","partname.Side":"Side","partname.Side panel":"Sidepanel","partname.Sink rail":"Vaskeskinne","partname.Slatted panel":"Lamelpanel","partname.Sliding door":"Skydelåge","partname.Speaker shelf":"Højttalerhylde","partname.Splashback":"Stænkplade","partname.Support":"Støtte","partname.TV divider":"TV-skillevæg","partname.TV panel":"TV-panel","partname.TV shelf":"TV-hylde","partname.TV side":"TV-side","partname.TV top":"TV-top","partname.Tall cabinet side":"Højskabsside","partname.Toe kick":"Sokkelliste","partname.Top":"Top","partname.Top and bottom":"Top og bund","partname.Top infill":"Top udfyldning","partname.Utility shelf":"Bryggershylde","partname.Wall cabinet bottom":"Overskabsbund","partname.Wall cabinet side":"Overskabsside","partname.Wall cabinet top":"Overskabstop","partname.Wall shelf":"Vægshylde","partname.Washer shelf":"Vaskemaskinehylde","partname.Wine shelf":"Vinhylde","partname.Worktop":"Bordplade",
  'msg.noSitePicture':'Der er ikke noget byggepladsfoto tilgængeligt.','msg.sitePhotoBesideDrawing':'Byggepladsfotoet er nu ved siden af tegneværktøjerne som reference.','msg.confirmDeleteWardrobe':'Slet dette skab og alle dets dele?','msg.openProjectFirst':'Åbn et projekt først.','msg.confirmDeleteRoomUnassigned':'Slet rummet "{0}"? Skabene bliver utildelt.','msg.jobSaved':'Job gemt.','msg.projectNotFound':'Projekt ikke fundet.','msg.enterCustomerName':'Indtast et kundenavn.','msg.customerAlreadyExists':'"{0}" findes allerede.','msg.confirmDeleteCustomer':'Slet "{0}"?\n\nDette kan ikke fortrydes.','msg.confirmDeleteCustomerAndJobs':'Slet "{0}" og {1} job?\n\nDette kan ikke fortrydes.','msg.siteUpdatesImported':'Byggepladsopdateringer importeret. Installationsstatus, noter og fotos er nu tilbage i Studio.','msg.notValidSiteUpdateZip':'Dette er ikke en gyldig AssembleOne byggeplads-opdaterings-ZIP.','msg.confirmDeleteWithoutSaving':'Slet "{0}" uden at gemme det nogen steder?\n\nDette kan ikke fortrydes.','msg.siteJobNoLongerWaiting':'Dette byggepladsjob venter ikke længere.','msg.savedToCustomerJobs':'Gemt under {0}\'s job — find det når som helst fra Mine projekter.','msg.couldNotSaveJobTryDrawing':'Kunne ikke gemme dette job. Prøv Åbn tegning i stedet.','msg.noNewSiteJobsWaiting':'Der venter ingen nye byggepladsjob.','msg.dropZipToReopen':'Slip en AssembleOne .zip-jobfil for at genåbne den.','msg.siteJobOpenedDrawing':'Byggepladsjob åbnet i Tegning. Det målte foto er klar som reference.','msg.directSyncNotAvailableBackup':'Direkte synkronisering er ikke tilgængelig her. Brug Åbn sikkerhedskopi.','msg.projectOpenedInStudio':'Projekt åbnet i AssembleOne Studio.','msg.notValidProjectZip':'Dette er ikke en gyldig AssembleOne-projekt-ZIP.','msg.choosePictureScreenshotPdf':'Vælg venligst et billede, skærmbillede eller en PDF-fil.','msg.drawingTooLargeStorage':'Tegningen vises korrekt, men den er for stor til permanent browserlagring. Hold denne side åben mens du arbejder, eller brug et mindre skærmbillede.','msg.drawingCouldNotOpen':'Tegningen kunne ikke åbnes.','msg.notPictureFileTryDragging':'Det element er ikke en billedfil. Prøv at trække en PNG eller JPG fra din Download- eller Billeder-mappe.','msg.forMarkingPanelsUsePngJpg':'Brug et PNG- eller JPG-skærmbillede af PDF\'en til at markere plader.','msg.confirmDeletePanel':'Slet {0}?','msg.markOrSelectPanelFirst':'Marker eller vælg en plade først.','msg.markPanelFirst':'Marker en plade først.','msg.choosePanelFirst':'Vælg en plade først.','msg.allMarkersAlreadyOnDrawing':'Alle {0} markører er allerede på tegningen.','msg.setQuantityFirst':'Sæt Antal over 1 først, brug så dette til at placere en markør for hver enkelt på én gang.','msg.addedMoreMarkers':'Tilføjede {0} flere markør(er), så alle {1} nu er på tegningen. Træk hver enkelt til dens rigtige plads, og scan derefter dens egen QR-kode, når den er monteret.','msg.selectRepeatedMarkerFirst':'Vælg først en af de gentagne markører.','msg.noCompletePartsReady':'Ingen komplette dele er klar. Tilføj først delnavn, tykkelse, længde og bredde.','msg.confirmRemovePin':'Fjern denne nål?','msg.confirmRemoveLinkedGroupChat':'Fjern denne forbundne gruppechat?','msg.finishAllSectionsFirst':'Afslut Start, Tegning, Plader, Skæreliste og QR-etiketter først. Hver boks bliver grøn, når den er klar.','msg.dropValidFileTypes':'Slip en PNG-, JPG-, WEBP- eller PDF-fil her.','msg.printPreviewCouldNotOpen':'Udskriftsvisningen kunne ikke åbnes. Prøv igen.','msg.noCompletePanelsToPrint':'Ingen komplette plader er klar til udskrivning.','msg.generateQrCodesFirst':'Generer QR-koder først.','msg.openJobFirst':'Åbn et job først.','msg.nothingSentNoUnit':'Der blev ikke sendt noget, fordi dette job endnu ikke har en enhed.','msg.nothingSentNoPanels':'Der blev ikke sendt noget, fordi dette job endnu ikke har nogen plader.','msg.confirmPanelsNotChecked':'{0} plade(r) er endnu ikke blevet tjekket (mangler detaljer eller ikke gennemgået). Send alligevel?','msg.cuttingListSent':'Skæreliste sendt: {0} plader og {1} stykker.','msg.siteJobSent':'Byggepladsjob sendt: {0} rum, {1} enhed, {2} plader og {3} stykker.','msg.phoneConnectionFailed':'Telefonforbindelsen mislykkedes. Tjek at begge enheder har internet, og prøv igen.','msg.typeNoteFirst':'Skriv en note først.','msg.confirmClearAllData':'Dette fjerner alle job, tegninger og indstillinger gemt på denne enhed. Dette kan ikke fortrydes. Fortsæt?','msg.addPanelBeforeTemplate':'Tilføj mindst én plade, før du gemmer en skabelon.','msg.pleaseAddMissing':'Tilføj venligst: {0}','msg.samePartNumberAdded':'Det samme delnummer er blevet tilføjet igen. Træk den nye markør hen til det tilhørende panel.','msg.confirmDeleteJobBase':'Slet "{0}"?\n\nDette sletter permanent alle skabe, tegninger, paneler, skærelister, QR-mærker -- OG eventuelle fotos eller mål gemt til dette job.','msg.confirmDeleteJobPhotos':'\n\nDette job har {0} foto(s) gemt på det. De vil forsvinde, medmindre telefonen stadig har dem, og du sender dem igen.','msg.confirmDeleteJobSibling':'\n\n⚠️ Dette ligner rum {0} af {1} fra samme besøg på byggepladsen ({2}) -- sørg for, at dette er det, du faktisk vil slette, og ikke et rum, du har forvekslet med en duplikat.','home.tagline':'Rum · Skærelister · QR-paneler','status.ready':'Klar','status.installed':'Installeret','status.missing':'Mangler','status.damaged':'Beskadiget','common.unnamedPart':'Unavngivet del','common.notSet':'Ikke angivet','common.qty':'Antal','common.noPanelsMarked':'Ingen paneler markeret endnu.','common.material':'Materiale:','common.edging':'Kantbånd:','common.notes':'Noter:','common.status':'Status:','common.choosePartName':'Vælg delnavn','common.testQr':'Test QR','common.notTestedYet':'Ikke testet endnu','common.noPartsInWardrobe':'Ingen dele i dette skab.','common.markerXOfY':'markør {0} af {1}','common.doubleClickTickOff':'dobbeltklik for at afkrydse','common.noCompleteComponentsYet':'Ingen komplette komponenter endnu. Udfyld først navnet og alle mål.','step.start':'Start','step.drawing':'Tegning','step.panels':'Paneler','step.cuttingList':'Skæreliste','step.qrLabels':'QR-mærker','step.finish':'Afslut','common.completeFirstFiveStages':'Fuldfør de første fem trin, før du sender projektet','common.openThisSection':'Åbn dette afsnit','common.sendCompletedProjectPhone':'Send det færdige projekt til telefon eller iPad','common.completeAllFiveStepsFirst':'Fuldfør først de fem foregående trin','common.readyToSend':'Klar til at sende','common.completeEveryStepFirst':'Fuldfør først alle trin','common.completeSuffix':' fuldført','common.notCompleteSuffix':' ikke fuldført','common.openStepPrefix':'Åbn ','common.panelCheck':'Panelkontrol','trade.builder':'Bygmester','trade.bricklayer':'Murer','trade.carpenter':'Tømrer','trade.electrician':'Elektriker','trade.plumber':'VVS-installatør','trade.decorator':'Maler','trade.flooring':'Gulvlægger','trade.wardrobes':'Garderobeskabe','trade.kitchenInstaller':'Køkkenmontør','trade.tiler':'Fliselægger','trade.hvac':'Ventilation/Aircondition','trade.heating':'Varme','trade.windows':'Vinduer','trade.doors':'Døre','trade.roofer':'Tagdækker','trade.steelworker':'Stålarbejder','trade.landscaper':'Anlægsgartner','trade.supplier':'Leverandør','trade.client':'Kunde','trade.other':'Andet','trade.measurement':'Måling','common.move':'Flyt','common.done':'Færdig','common.delete':'Slet','common.messagePrefix':'Besked til ','common.tapPinOnPlan':'Tryk på en nål på planen.','common.tradeLabel':'Fag','common.roomAreaLabel':'Rum / område','common.bathroomExample':'Badeværelse','common.statusLabel':'Status','common.pinStatusNew':'⚪ Ny','common.pinStatusWaiting':'🟡 Venter','common.pinStatusDone':'🟢 Færdig','common.pinStatusProblem':'🔴 Problem','common.measurementTypeLabel':'Målingstype','common.wallToWall':'Væg til væg','common.measurementMmLabel':'Måling (mm)','common.mainNoteLabel':'Hovednotat','common.whatNeedsDoingPlaceholder':'Hvad skal der laves her?','common.photoLabel':'Foto','common.savePinBtn':'Gem nål','common.deletePinBtn':'Slet nål','common.conversationAtPin':'Samtale ved denne nål','common.noRepliesYet':'Ingen svar endnu.','common.writeShortReplyPlaceholder':'Skriv et kort svar…','common.sendBtn':'Send','common.dragTradePinToStart':'Træk en fagnål hen over en anden for at starte en gruppesamtale.','common.reopen':'Genåbn','common.markDone':'Marker som færdig','common.deleteLink':'Slet forbindelse','common.noMessagesYet':'Ingen beskeder endnu.','common.writeShortMessagePlaceholder':'Skriv en kort besked…','common.stageWaiting':'Venter','common.stageStarted':'Startet','common.stageDelayed':'Forsinket','common.stageReadyNext':'Klar til næste fag','common.stageComplete':'Fuldført','common.addStagesHint':'Tilføj kun trin, når du har brug for en arbejdsrækkefølge.','common.tradeOrStagePrompt':'Fag eller trin','common.noCustomersMatchSearch':'Ingen kunder matcher din søgning.','common.noCustomersYet':'Ingen kunder endnu. Tryk på "+ Ny kunde" for at tilføje en, eller send en byggepladsopgave fra din telefon.','common.jobsCount':'{0} job','common.openInMapsLink':'Åbn i Maps ›','common.openPinnedLocationMaps':'📍 Åbn den fastgjorte placering i Maps ›','common.dragToTradeDbTitle':'Træk til din fagdatabase, skrivebordet eller en anden app for at gemme en kopi af dette job','common.roomFallback':'Rum','common.openArrowBtn':'Åbn ›','common.noJobsYetCustomer':'Ingen job endnu for denne kunde.','common.siblingRoomTag':'🔗 Rum {0} af {1} fra samme besøg på byggepladsen — ikke et duplikat','common.customerNotNamed':'Kunde ikke navngivet','common.newSiteJob':'Ny byggepladsopgave','common.roomNotNamed':'Rum ikke navngivet','common.newBadge':'NY','common.noNewJobsBadge':'Ingen nye job','common.noNewSiteJobsList':'Ingen nye byggepladsopgaver','common.jobCouldNotBeRead':'⚠ Jobbet kunne ikke læses','common.jobDataCorrupted':'Dette jobs data er beskadiget. Fjern det, så det ikke blokerer nye job.','common.remove':'Fjern','common.removeWithoutOpening':'Fjern uden at åbne','common.saveToCustomer':'📁 Gem til kunde','common.openDrawingArrow':'Åbn tegning ›','common.useBackupFile':'Brug sikkerhedskopi','common.directSyncUnavailableUseBackup':'Direkte synkronisering ikke tilgængelig. Brug sikkerhedskopien.','common.couldNotAddDrawing':'Kunne ikke tilføje tegning','common.roomsArea':'Rumområde','common.selectedFileCouldNotBeRead':'Den valgte fil kunne ikke læses.','common.openingFileCancelled':'Åbning af filen blev annulleret.','common.openingFileEllipsis':'Åbner ','common.photoOrScreenshotFallback':'foto eller skærmbillede','common.fileWasEmpty':'Filen var tom.','common.tryAnotherPictureScreenshot':'Prøv et andet billede eller skærmbillede.','common.checkingClipboardForDrawing':'Tjekker udklipsholderen for en tegning…','common.drawingPastedFromClipboard':'Tegning indsat fra udklipsholderen.','common.copyDrawingThenPasteHint':'Kopiér tegningen, og tryk derefter på Ctrl + V. Tegningsboksen er klar.','common.installerNotesHeading':'Installatørnoter','common.accessOrderPlaceholder':'Adgang, arbejdsrækkefølge, stikkontakter, fodlister eller andre instruktioner','common.inThisRoomHeading':'I dette rum','common.panelsTapToRemove':'paneler · tryk for at fjerne','common.noWardrobeCabinetYet':'Intet skab her endnu.','common.addWardrobeCabinetHeading':'Tilføj et skab','common.panelsWord':'paneler','common.noUnassignedUnits':'Ingen utildelte enheder. Tilføj først et skab, eller åbn et andet rum.','common.renameRoomBtn':'Omdøb rum','common.deleteRoomBtn':'Slet rum','common.roomNamePrompt':'Rumnavn:','common.wardrobeOrCabinetCount':'{0} skab(e)','common.placeUnitsBtn':'Placer {0} enhed(er)','common.tapRoomAddUnit':'Tryk på et rum, og tilføj derefter enheden','common.noRoomSelectedYet':'Intet rum valgt endnu. Tryk på Vælg rum, og tryk på et billede.','roomType.kitchen':'Køkken','roomType.livingRoom':'Stue','roomType.tvWall':'TV-væg','roomType.masterBedroom':'Hovedsoveværelse','roomType.bedroom':'Soveværelse','roomType.kidsBedroom':'Børneværelse','roomType.dressingRoom':'Walk-in closet','roomType.bathroom':'Badeværelse','roomType.office':'Kontor','roomType.laundry':'Bryggers','roomType.utilityRoom':'Depotrum','roomType.hallway':'Entré','roomType.underStairs':'Under trappen','roomType.wineRoom':'Vinrum','roomType.library':'Bibliotek','roomType.custom':'Tilpasset','common.chooseRoomHeading':'Vælg rum','common.tapPictureRoomHelp':'Tryk på billedet for det rum, du arbejder i. Du kan tilføje samme rumtype mere end én gang.','common.typeRoomNamePlaceholder':'Skriv rumnavnet','common.addRoomBtn':'Tilføj rum','common.editJobHeading':'Rediger job','common.jobNameLabel':'Jobnavn','common.customerLabel':'Kunde','common.cancelBtn':'Annuller','common.saveBtn':'Gem','common.createOrOpenJobNote':'Opret et nyt job, eller åbn et gemt job.','common.untitledJob':'Unavngivet job','common.addCustomer':'Tilføj kunde','common.editBtn':'Rediger','common.chooseRoomBtn':'Vælg rum','common.continueToDrawing':'➡ Fortsæt til tegning','common.openDrawingBtn':'Åbn tegning','common.roomsWord':'rum','common.unitsWord':'enheder','common.materialsWord':'materialer','common.piecesWord':'stykker','common.oneUnit':'1 enhed','common.unitsCount':'{0} enheder','common.piecesCount':'{0} stykker','common.selectedRoomPrefix':'Valgt rum · ','common.noCustomerName':'Intet kundenavn','common.everythingReady':'Alt klar','common.checkRedCardsBeforeSending':'Tjek de røde kort, før du sender','common.qrPanelsTitle':'QR-paneler','common.projectNotesTitle':'Projektnoter','common.roomsHeading':'Rum','common.noRoomsYet':'Ingen rum endnu.','common.panelsNeedMoreInfo':'⚠ {0} panel(er) mangler flere oplysninger før skærelisten.','common.noPanelsYetReturnDrawing':'Ingen paneler endnu. Gå tilbage til Tegning, og markér det første panel.','common.panelsReadyCount':'{0} af {1} paneler klar','common.longShortEdges':'{0} lang(e) kant(er) · {1} kort(e) kant(er)','common.measurementsLabel':'Mål:','common.panelCheckedLabel':'Panel kontrolleret','common.panelNotCheckedLabel':'Panel ikke kontrolleret','common.doubleClickApprovePanel':'Dobbeltklik for at godkende dette panel','common.doubleClickAfterChecking':'Dobbeltklik, når du har kontrolleret dette panel','common.buildChecklistHeading':'Byggetjekliste','common.hardwareChecklistHeading':'Beslagtjekliste','common.tickedOffCount':'{0} af {1} afkrydset','common.autoPickedUpHint':'Hvert panel, du navngiver på tegningen, hentes automatisk her — ingen grund til at skrive det ind.','common.addOwnElectricalPlaceholder':'Tilføj din egen, f.eks. Elinstallationspanel','common.addOwnSoftClosePlaceholder':'Tilføj din egen, f.eks. Softclose-dæmpere','common.addBtnPlus':'+ Tilføj','common.useSavedTemplateHeading':'Brug en gemt skabelon?','common.startFromPreviousHint':'Start dette skab ud fra en tidligere panelliste, eller start forfra.','common.panelsHardwareCount':'{0} panel(er) · {1} beslag','common.startBlankBtn':'Start forfra','common.saveAsTemplateHeading':'Gem som skabelon','common.templateNameLabel':'Skabelonnavn','common.templateNamePlaceholder':'f.eks. Skab med to låger','common.saveTemplateBtn':'Gem skabelon','common.edgingConfirmationNeeded':'Kantbånd og alle detaljer skal bekræftes','common.editPanelBtn':'Rediger panel','hardware.hinges':'Hængsler','hardware.handles':'Håndtag','hardware.shelfPins':'Hyldeknopper','hardware.ledLights':'LED-lys','hardware.ledDriverTransformer':'LED-driver/transformer','hardware.screwsFixings':'Skruer og beslag','common.addedOnDrawing':'Tilføjet på tegningen','common.panelSavedToast':'Panel gemt','common.panelSavedNextReady':'Panel gemt · Næste panel klar','common.panelCouldNotBeSaved':'Panelet kunne ikke gemmes','common.addMainInfoHint':'Tilføj de vigtigste oplysninger, som montøren skal huske.','common.accessOrderSpecialPlaceholder':'Adgang, arbejdsrækkefølge, særlige instruktioner, lys eller andet vigtigt','common.saveNotesBtn':'✓ Gem noter','common.noWardrobeSelected':'Intet skab valgt.','common.noCompletePartsReadySupplier':'Ingen komplette dele er klar til leverandøren. Tilføj først navn, tykkelse, længde og bredde.','common.partTypeCount':'{0} deltype(r)','common.partNoHeader':'Delnr.','common.panelDetailsHeader':'Paneldetaljer','common.descWhereGoesHeader':'Beskrivelse / hvor det skal','common.noProjectSelected':'Intet projekt valgt.','common.noImageDrawingAvailable':'Ingen billedtegning tilgængelig.','common.partHeader':'Del','common.descriptionHeader':'Beskrivelse','common.statusHeaderPlain':'Status','common.panelNotFound':'Panel ikke fundet','common.drawingMissingFor':'Tegning mangler for {0}','common.openedOnDrawing':'{0} åbnet på det fremhævede tegning','common.allowPopupsPrintQr':'Tillad pop-ups for at udskrive QR-mærkater','common.qrCodesGenerated':'QR-koder genereret','nav.home':'Hjem','nav.customers':'Kunder','nav.qrAndScan':'QR og scan','nav.finishJob':'Afslut job','nav.settings':'Indstillinger','drawing.saveToCustomer':'Gem til kunde','jobs.newJobCustomerPrompt':'Kundenavn til dette job?','drawing.enterCustomerNamePrompt':'Hvilken kunde er dette job til?','common.savedToCustomerToast':'Gemt til {0}'
 },
 de:{start:'Projekt starten',startHelp:'Auftrag eingeben und auswählen, was gebaut wird. Räume bleiben im Projekt und werden an das Telefon gesendet.',job:'Woran arbeitest du?',summary:'Auftrag abschließen',summaryHelp:'Eine letzte Sichtprüfung, dann speichern oder eine Notiz an das Montageteam senden.',finish:'An Telefon oder iPad senden',noteLabel:'Notiz für das Telefon',noteHint:'Wird separat gesendet, unabhängig von der Zuschnittliste — praktisch für eine kurze Nachricht zu diesem Auftrag, in jeder Phase.',notePlaceholder:'Beispiel: Roter Schrank — Kunde möchte Softclose-Scharniere, vor dem Einbau bestätigen.',noteSendBtn:'Notiz an Telefon senden',noteSendSmall:'Nur diese Notiz, keine Zuschnittliste nötig',
  'bom.pcsShort':'Stk','bomScreen.deleteJob':'Diesen Auftrag löschen','bomScreen.saveProject':'Projekt speichern','bomScreen.saveProjectSub':'Alle Studio-Änderungen behalten','bomScreen.templateCheck':'Vorlagen- und Beschlagprüfung','bomScreen.templateCheckSub':'Paneele, Scharniere, Lichter, Schienen, Schubladen und Beschläge vor dem Senden erneut prüfen.',
  'customers.addCustomer':'💾 Kunde hinzufügen','customers.address':'Adresse','customers.backToCustomers':'← Kunden','customers.cancel':'Abbrechen','customers.delete':'🗑 Löschen','customers.edit':'✏️ Bearbeiten','customers.heading':'Kunden','customers.name':'Name','customers.newCustomer':'+ Neuer Kunde','customers.phone':'Telefon','customers.save':'💾 Speichern','customers.searchPlaceholder':'Kunden suchen...','customers.subtitle':'Jeder Auftrag, gespeichert und nach Kunde organisiert.',
  'drawing.back':'Zurück','drawing.catDoors':'Türen und Schubladen','drawing.catInfills':'Füllungen','drawing.catKitchen':'Küchenschränke','drawing.catTv':'TV-Wände und Möbel','drawing.catUtility':'Hauswirtschaft und Sonderteile','drawing.catWardrobes':'Schränke und Kleiderschränke','drawing.checkAllPanels':'✓ Alle Paneele prüfen','drawing.chooseDrawing':'Zeichnung wählen','drawing.chosenParts':'Gewählte Teile','drawing.delete':'Löschen','drawing.dropHere':'Zeichnung, Screenshot oder Foto hier ablegen','drawing.dropHereHint':'Verwenden Sie die Schaltflächen oben, ziehen Sie eine Zeichnung in dieses Feld, oder drücken Sie Strg + V nach dem Kopieren eines Screenshots.','drawing.dropHereSub':'Einfügen, ablegen, Datei wählen oder Foto machen.','drawing.edgeBandingTitle':'Doppelklick, um Kantung hinzuzufügen','drawing.edgeHelp':'Doppelklicken Sie auf die Länge oder Breite, um Kantung hinzuzufügen: keine Linie → eine Linie → doppelte Linie.','drawing.fit':'Einpassen','drawing.fitDrawing':'Zeichnung einpassen','drawing.leftRight':'Links / Rechts','drawing.length':'Länge','drawing.makeUnique':'Ausgewählte Markierung eindeutig machen','drawing.materialChooseOnce':'Material — einmal für diesen Auftrag wählen','drawing.materialHint':'Geben Sie den genauen Materialnamen für diesen Auftrag ein.','drawing.materialPrefix':'Material','drawing.morePartNames':'Weitere Teilenamen','drawing.noDrawing':'Keine Zeichnung','drawing.noPanelSelected':'Kein Paneel ausgewählt','drawing.notesHint':'Weitere Notiz hinzufügen oder verwenden','drawing.notesOptional':'Notizen — optional','drawing.notesPrefix':'Notizen','drawing.panelOptions':'Paneeloptionen','drawing.partName':'Teilename','drawing.partNamePlaceholder':'Teilenamen wählen oder eingeben…','drawing.partSelected':'Teil ausgewählt','drawing.pasteDrawing':'Zeichnung einfügen','drawing.pasteTitle':'Einen kopierten Screenshot oder ein Bild einfügen','drawing.putSameNumber':'+ Gleiche Nummer auf Zeichnung setzen','drawing.quantity':'Menge','drawing.samePanelMarkers':'Gleiche Paneelmarkierungen:','drawing.saveMaterial':'Material speichern','drawing.saveNext':'Speichern & weiter','drawing.thickness':'Dicke','drawing.topBottom':'Oben / Unten','drawing.width':'Breite','drawing.zoomIn':'Vergrößern','drawing.zoomOut':'Verkleinern',
  'home.addLabel':'Hinzufügen','home.addUnitBelow':'Fügen Sie unten die richtige Einheit hinzu.','home.addWardrobe':'+ Kleiderschrank oder Schrank hinzufügen','home.back':'← Zurück','home.back2':'Zurück','home.backHome':'← Start','home.chooseRoomHeading':'Raum wählen','home.chooseRoomHint':'Tippen Sie auf eine große Bildschaltfläche. Der Raum bleibt im Projekt und wird automatisch an das Telefon gesendet.','home.chooseRoomHint2':'Wählen Sie oben einen Raum, fügen Sie dann das passende Möbelstück für diesen Raum hinzu.','home.continueJob':'Aktuellen Auftrag fortsetzen','home.currentJobFallback':'Aktueller Auftrag','home.customerLabel':'Kunde','home.customerPlaceholder':'Kundenname','home.customersJobs':'Kunden und Aufträge','home.customersJobsSub':'Alle Kunden und ihre Projekte anzeigen','home.jobNameHint':'Benennen Sie den Auftrag einmal, wählen Sie dann den Raum, an dem Sie arbeiten.','home.jobNameLabel':'Auftragsname','home.jobNamePlaceholder':'z. B. Haus Simone','home.newProject':'Neues Projekt','home.newProjectSub':'Neuen Kunden oder neues Projekt starten','home.openJobHint':'Öffnen Sie den Auftrag, an dem Sie arbeiten','home.recentJobs':'Letzte Aufträge','home.recentJobsSub':'Ihre zuletzt geöffneten Aufträge','home.saveTemplateLater':'＋ Später eine neue Vorlage speichern','home.selectedRoomPrefix':'Ausgewählter Raum:','home.siteJobs':'Baustellenaufträge','home.siteJobsNew':'Neue Aufträge von Ihrem Telefon gesendet','home.siteJobsSub':'Fotos & Messungen von Ihrem Telefon','home.templateFourDoor':'Kleiderschrank mit vier Türen','home.templateReady':'Bereit für Ihre gespeicherte Checkliste','home.templateThreeSliding':'Kleiderschrank mit drei Schiebetüren','home.templatesHeading':'🗂️ Meine Vorlagen','home.templatesSub':'Ihre individuelle Bibliothek wird hier erscheinen.','home.unitCabinet':'Schrank','home.unitKitchen':'Küchenelement','home.unitLivingRoom':'Wohnzimmerelement','home.unitOffice':'Büroelement','home.unitTvWall':'TV-Wand','home.unitUnderStairs':'Element unter der Treppe','home.unitWardrobeOrCabinet':'Kleiderschrank oder Schrank','home.viewAll':'Alle anzeigen','home.welcomeSubtitle':'Planen, gestalten und verwalten Sie Ihre Projekte mit Leichtigkeit.','home.welcomeTitle':'Willkommen bei AssembleOne Studio 👋','home.whatBuilding':'Was bauen Sie?',
  'parts.heading':'Paneelprüfung','parts.subtitle':'Prüfen Sie jedes Paneel, bevor Sie die Zuschnittliste erstellen.',
  'phoneScreen.heading':'Raumführer','phoneScreen.part':'Teil','phoneScreen.subtitle':'Das ausgewählte Paneel ist hervorgehoben.',
  'qrScreen.generate':'QR-Codes generieren','qrScreen.heading':'QR-Etiketten — nur ausgewählter Schrank','qrScreen.print':'QR-Etiketten drucken','qrScreen.smartQr':'Smart QR:','qrScreen.smartQrBody':'Scannen Sie innerhalb von AssembleOne, um genau das hervorgehobene Paneel zu öffnen. Wenn die mobile App eine öffentliche Webadresse hat, fügen Sie sie unten ein, und die normale Telefonkamera kann das Paneel ebenfalls direkt öffnen.','qrScreen.subtitle':'QR-Codes anderer Aufträge und Schränke werden getrennt gehalten.','qrScreen.webAddress':'Web-Adresse der mobilen App','qrScreen.webAddressHint':'Lassen Sie dies beim lokalen Testen leer. Scannen Sie dann mit dem Scanner in AssembleOne Mobile. Das veröffentlichte Projekt muss bereits auf dem Telefon oder iPad geöffnet sein.',
  'settingsScreen.appData':'App-Daten','settingsScreen.appDataHint':'Entfernen Sie alle Aufträge, Zeichnungen und Einstellungen, die auf diesem Gerät gespeichert sind. Dies kann nicht rückgängig gemacht werden.','settingsScreen.clearData':'Alle Daten auf diesem Gerät löschen','settingsScreen.cloudSync':'Cloud-Synchronisierung','settingsScreen.cloudSyncHint':'Dieses Gerät synchronisiert sich automatisch über die Cloud mit der Telefon-App. Keine Anmeldung erforderlich.','settingsScreen.heading':'Einstellungen','settingsScreen.language':'Sprache','settingsScreen.languageHint':'Verwenden Sie das Flaggenmenü oben auf dem Bildschirm, um die App-Sprache zu ändern.','settingsScreen.subtitle':'App-Einstellungen und Synchronisierung.','settingsScreen.unitCm':'Zentimeter (cm)','settingsScreen.unitIn':'Zoll (in)','settingsScreen.unitMm':'Millimeter (mm)','settingsScreen.units':'Maßeinheiten','settingsScreen.unitsHint':'Wählen Sie, wie Paneelgrößen auf dem Zeichenbildschirm angezeigt und eingegeben werden.',
  sitePlanner:'Baustellenplaner','siteScreen.addFloorPlan':'Fügen Sie einen Grundriss oder ein Baustellenfoto hinzu. Wählen Sie dann oben ein Gewerk und tippen Sie auf den Plan.','siteScreen.addMeasurement':'↔ Messung','siteScreen.addPlan':'Baustellenplan hinzufügen / ändern','siteScreen.addWorkStage':'+ Arbeitsphase','siteScreen.chooseTrade':'Wählen Sie ein Gewerk, tippen Sie dann auf die genaue Stelle auf dem Plan','siteScreen.chooseTradeMessage':'Wählen Sie ein Gewerk und senden Sie eine Projektnachricht.','siteScreen.pinHint':'Die Nadel wird zu einer kleinen Unterhaltung für alle, die an diesem Punkt arbeiten.','siteScreen.selectedPin':'Ausgewählte Nadel','siteScreen.showTrades':'Gewerke anzeigen','siteScreen.subtitle':'Setzen Sie Arbeit, Notizen und Gespräche direkt auf den Grundriss oder das Baustellenfoto.','siteScreen.tapPin':'Tippen Sie auf eine Nadel auf dem Plan.','siteScreen.tapPinHint':'Tippen Sie auf eine Nadel, um zu lesen oder zu antworten. Tippen Sie nach Auswahl eines Gewerks auf eine leere Stelle, um eine neue Nadel hinzuzufügen.','siteScreen.tradeMessages':'Gewerke-Nachrichten','siteScreen.workOrder':'Arbeitsauftrag',
  "partname.Adjustable shelf":"Verstellbarer Boden","partname.Appliance panel":"Geräteblende","partname.Back panel":"Rückwand","partname.Base bottom":"Unterschrankboden","partname.Base shelf":"Unterschrankboden-Einlegeboden","partname.Base side":"Unterschrankseite","partname.Base top":"Unterschrankdecke","partname.Batten":"Holzleiste","partname.Bench top":"Bankplatte","partname.Book shelf":"Bücherregal","partname.Bottom":"Unten","partname.Bottom infill":"Untere Füllung","partname.Bracket":"Winkel","partname.Cable panel":"Kabelblende","partname.Centre divider":"Mittelsteg","partname.Cleat":"Leiste","partname.Clip":"Clip","partname.Cover panel":"Abdeckplatte","partname.Custom panel":"Benutzerdefiniertes Paneel","partname.Desk side":"Schreibtischseite","partname.Desk top":"Schreibtischplatte","partname.Dishwasher panel":"Spülmaschinenblende","partname.Divider":"Trennwand","partname.Door":"Tür","partname.Drawer back":"Schubladenrückwand","partname.Drawer bottom":"Schubladenboden","partname.Drawer divider":"Schubladentrenner","partname.Drawer front":"Schubladenfront","partname.Drawer side":"Schubladenseite","partname.Drawer support":"Schubladenstütze","partname.Dryer shelf":"Trocknerboden","partname.End panel":"Seitenverkleidung","partname.Filler panel":"Füllplatte","partname.Fireplace panel":"Kaminverkleidung","partname.Fixed shelf":"Festboden","partname.Fridge panel":"Kühlschrankblende","partname.Glass shelf":"Glasboden","partname.Handle":"Griff","partname.Hanging rail":"Kleiderstange","partname.Hob rail":"Kochfeldschiene","partname.Infill":"Füllung","partname.Kickboard":"Sockelblende","partname.LED profile":"LED-Profil","partname.Left door":"Linke Tür","partname.Left infill":"Linke Füllung","partname.Left-hand side":"Linke Seite","partname.Light panel":"Lichtpaneel","partname.Mirror panel":"Spiegelpaneel","partname.Modesty panel":"Sichtblende","partname.Oven rail":"Backofenschiene","partname.Pair of doors":"Türpaar","partname.Plinth":"Sockel","partname.Pocket door":"Taschenschiebetür","partname.Printer shelf":"Druckerboden","partname.Right door":"Rechte Tür","partname.Right infill":"Rechte Füllung","partname.Right-hand side":"Rechte Seite","partname.Scribe panel":"Anpassungsplatte","partname.Seat top":"Sitzplatte","partname.Shelf":"Regalboden","partname.Side":"Seite","partname.Side panel":"Seitenteil","partname.Sink rail":"Spülenschiene","partname.Slatted panel":"Lamellenpaneel","partname.Sliding door":"Schiebetür","partname.Speaker shelf":"Lautsprecherboden","partname.Splashback":"Spritzschutz","partname.Support":"Stütze","partname.TV divider":"TV-Trennwand","partname.TV panel":"TV-Paneel","partname.TV shelf":"TV-Boden","partname.TV side":"TV-Seitenteil","partname.TV top":"TV-Deckplatte","partname.Tall cabinet side":"Hochschrankseite","partname.Toe kick":"Sockelleiste","partname.Top":"Oben","partname.Top and bottom":"Oben und unten","partname.Top infill":"Obere Füllung","partname.Utility shelf":"Hauswirtschaftsboden","partname.Wall cabinet bottom":"Oberschrankboden","partname.Wall cabinet side":"Oberschrankseite","partname.Wall cabinet top":"Oberschrankdecke","partname.Wall shelf":"Wandregal","partname.Washer shelf":"Waschmaschinenboden","partname.Wine shelf":"Weinregal","partname.Worktop":"Arbeitsplatte",
  'msg.noSitePicture':'Es ist kein Baustellenfoto verfügbar.','msg.sitePhotoBesideDrawing':'Das Baustellenfoto befindet sich jetzt als Referenz neben den Zeichenwerkzeugen.','msg.confirmDeleteWardrobe':'Diesen Schrank und alle seine Teile löschen?','msg.openProjectFirst':'Öffne zuerst ein Projekt.','msg.confirmDeleteRoomUnassigned':'Raum "{0}" löschen? Die Schränke werden nicht mehr zugeordnet.','msg.jobSaved':'Auftrag gespeichert.','msg.projectNotFound':'Projekt nicht gefunden.','msg.enterCustomerName':'Gib einen Kundennamen ein.','msg.customerAlreadyExists':'"{0}" existiert bereits.','msg.confirmDeleteCustomer':'"{0}" löschen?\n\nDies kann nicht rückgängig gemacht werden.','msg.confirmDeleteCustomerAndJobs':'"{0}" und {1} Auftrag/Aufträge löschen?\n\nDies kann nicht rückgängig gemacht werden.','msg.siteUpdatesImported':'Baustellen-Updates importiert. Installationsstatus, Notizen und Fotos sind jetzt wieder in Studio.','msg.notValidSiteUpdateZip':'Dies ist keine gültige AssembleOne-Baustellen-Update-ZIP-Datei.','msg.confirmDeleteWithoutSaving':'"{0}" löschen, ohne es irgendwo zu speichern?\n\nDies kann nicht rückgängig gemacht werden.','msg.siteJobNoLongerWaiting':'Dieser Baustellenauftrag wartet nicht mehr.','msg.savedToCustomerJobs':'Gespeichert unter den Aufträgen von {0} — jederzeit über Meine Projekte zu finden.','msg.couldNotSaveJobTryDrawing':'Dieser Auftrag konnte nicht gespeichert werden. Versuche stattdessen Zeichnung öffnen.','msg.noNewSiteJobsWaiting':'Es warten keine neuen Baustellenaufträge.','msg.dropZipToReopen':'Lege eine AssembleOne-.zip-Auftragsdatei ab, um sie erneut zu öffnen.','msg.siteJobOpenedDrawing':'Baustellenauftrag in Zeichnung geöffnet. Das vermessene Foto steht als Referenz bereit.','msg.directSyncNotAvailableBackup':'Die direkte Synchronisierung ist hier nicht verfügbar. Nutze Sicherungsdatei öffnen.','msg.projectOpenedInStudio':'Projekt in AssembleOne Studio geöffnet.','msg.notValidProjectZip':'Dies ist keine gültige AssembleOne-Projekt-ZIP-Datei.','msg.choosePictureScreenshotPdf':'Bitte wähle ein Bild, einen Screenshot oder eine PDF-Datei.','msg.drawingTooLargeStorage':'Die Zeichnung wird korrekt angezeigt, ist aber zu groß für die dauerhafte Speicherung im Browser. Halte diese Seite während der Arbeit geöffnet, oder nutze einen kleineren Screenshot.','msg.drawingCouldNotOpen':'Die Zeichnung konnte nicht geöffnet werden.','msg.notPictureFileTryDragging':'Dieses Element ist keine Bilddatei. Versuche, ein PNG oder JPG aus deinem Downloads- oder Bilder-Ordner zu ziehen.','msg.forMarkingPanelsUsePngJpg':'Nutze zum Markieren von Paneelen einen PNG- oder JPG-Screenshot des PDFs.','msg.confirmDeletePanel':'{0} löschen?','msg.markOrSelectPanelFirst':'Markiere oder wähle zuerst ein Paneel.','msg.markPanelFirst':'Markiere zuerst ein Paneel.','msg.choosePanelFirst':'Wähle zuerst ein Paneel.','msg.allMarkersAlreadyOnDrawing':'Alle {0} Markierungen sind bereits auf der Zeichnung.','msg.setQuantityFirst':'Setze zuerst die Menge über 1, und nutze dies dann, um für jedes Stück eine Markierung zu platzieren.','msg.addedMoreMarkers':'{0} weitere Markierung(en) hinzugefügt, sodass alle {1} auf der Zeichnung sind. Ziehe jede an ihre tatsächliche Stelle und scanne dann ihren eigenen QR-Code, sobald sie montiert ist.','msg.selectRepeatedMarkerFirst':'Wähle zuerst eine der wiederholten Markierungen.','msg.noCompletePartsReady':'Keine vollständigen Teile sind bereit. Füge zuerst Teilname, Dicke, Länge und Breite hinzu.','msg.confirmRemovePin':'Diesen Pin entfernen?','msg.confirmRemoveLinkedGroupChat':'Diesen verknüpften Gruppenchat entfernen?','msg.finishAllSectionsFirst':'Schließe zuerst Start, Zeichnung, Paneele, Zuschnittliste und QR-Etiketten ab. Jedes Feld wird grün, sobald es fertig ist.','msg.dropValidFileTypes':'Lege hier eine PNG-, JPG-, WEBP- oder PDF-Datei ab.','msg.printPreviewCouldNotOpen':'Die Druckvorschau konnte nicht geöffnet werden. Bitte versuche es erneut.','msg.noCompletePanelsToPrint':'Keine vollständigen Paneele sind druckbereit.','msg.generateQrCodesFirst':'Erzeuge zuerst QR-Codes.','msg.openJobFirst':'Öffne zuerst einen Auftrag.','msg.nothingSentNoUnit':'Es wurde nichts gesendet, da dieser Auftrag noch keine Einheit hat.','msg.nothingSentNoPanels':'Es wurde nichts gesendet, da dieser Auftrag noch keine Paneele hat.','msg.confirmPanelsNotChecked':'{0} Paneel(e) wurden noch nicht geprüft (Details fehlen oder nicht überprüft). Trotzdem senden?','msg.cuttingListSent':'Zuschnittliste gesendet: {0} Paneele und {1} Teile.','msg.siteJobSent':'Baustellenauftrag gesendet: {0} Raum, {1} Einheit, {2} Paneele und {3} Teile.','msg.phoneConnectionFailed':'Die Telefonverbindung ist fehlgeschlagen. Prüfe, ob beide Geräte Internet haben, und versuche es erneut.','msg.typeNoteFirst':'Schreibe zuerst eine Notiz.','msg.confirmClearAllData':'Dies entfernt alle Aufträge, Zeichnungen und Einstellungen, die auf diesem Gerät gespeichert sind. Dies kann nicht rückgängig gemacht werden. Fortfahren?','msg.addPanelBeforeTemplate':'Füge mindestens ein Paneel hinzu, bevor du eine Vorlage speicherst.','msg.pleaseAddMissing':'Bitte hinzufügen: {0}','msg.samePartNumberAdded':'Dieselbe Teilenummer wurde erneut hinzugefügt. Ziehe die neue Markierung auf das passende Panel.','msg.confirmDeleteJobBase':'"{0}" löschen?\n\nDies löscht dauerhaft alle Schränke, Zeichnungen, Paneele, Zuschnittlisten, QR-Etiketten -- UND alle für diesen Auftrag gespeicherten Fotos oder Maße.','msg.confirmDeleteJobPhotos':'\n\nDieser Auftrag hat {0} gespeicherte(s) Foto(s). Sie gehen verloren, es sei denn, das Telefon hat sie noch und du sendest sie erneut.','msg.confirmDeleteJobSibling':'\n\n⚠️ Das sieht aus wie Raum {0} von {1} aus demselben Baustellenbesuch ({2}) -- stelle sicher, dass dies wirklich der Raum ist, den du löschen möchtest, und nicht ein Raum, den du mit einem Duplikat verwechselt hast.','home.tagline':'Räume · Zuschnittlisten · QR-Paneele','status.ready':'Fertig','status.installed':'Installiert','status.missing':'Fehlt','status.damaged':'Beschädigt','common.unnamedPart':'Unbenanntes Teil','common.notSet':'Nicht festgelegt','common.qty':'Anz.','common.noPanelsMarked':'Noch keine Paneele markiert.','common.material':'Material:','common.edging':'Kantenbearbeitung:','common.notes':'Notizen:','common.status':'Status:','common.choosePartName':'Teilenamen wählen','common.testQr':'QR testen','common.notTestedYet':'Noch nicht getestet','common.noPartsInWardrobe':'Keine Teile in diesem Schrank.','common.markerXOfY':'Markierung {0} von {1}','common.doubleClickTickOff':'Doppelklick zum Abhaken','common.noCompleteComponentsYet':'Noch keine vollständigen Komponenten. Zuerst den Namen und alle Maße eintragen.','step.start':'Start','step.drawing':'Zeichnung','step.panels':'Paneele','step.cuttingList':'Zuschnittliste','step.qrLabels':'QR-Etiketten','step.finish':'Fertigstellen','common.completeFirstFiveStages':'Schließe die ersten fünf Schritte ab, bevor du das Projekt sendest','common.openThisSection':'Diesen Abschnitt öffnen','common.sendCompletedProjectPhone':'Das fertige Projekt an Telefon oder iPad senden','common.completeAllFiveStepsFirst':'Zuerst alle fünf vorherigen Schritte abschließen','common.readyToSend':'Bereit zum Senden','common.completeEveryStepFirst':'Zuerst alle Schritte abschließen','common.completeSuffix':' abgeschlossen','common.notCompleteSuffix':' nicht abgeschlossen','common.openStepPrefix':'Öffnen: ','common.panelCheck':'Panelprüfung','trade.builder':'Bauunternehmer','trade.bricklayer':'Maurer','trade.carpenter':'Zimmermann','trade.electrician':'Elektriker','trade.plumber':'Klempner','trade.decorator':'Maler','trade.flooring':'Bodenleger','trade.wardrobes':'Schränke','trade.kitchenInstaller':'Küchenmonteur','trade.tiler':'Fliesenleger','trade.hvac':'Klima-/Lüftungstechnik','trade.heating':'Heizung','trade.windows':'Fenster','trade.doors':'Türen','trade.roofer':'Dachdecker','trade.steelworker':'Stahlbauer','trade.landscaper':'Landschaftsgärtner','trade.supplier':'Lieferant','trade.client':'Kunde','trade.other':'Sonstiges','trade.measurement':'Messung','common.move':'Verschieben','common.done':'Fertig','common.delete':'Löschen','common.messagePrefix':'Nachricht an ','common.tapPinOnPlan':'Tippe auf eine Pinnadel auf dem Plan.','common.tradeLabel':'Gewerk','common.roomAreaLabel':'Raum / Bereich','common.bathroomExample':'Badezimmer','common.statusLabel':'Status','common.pinStatusNew':'⚪ Neu','common.pinStatusWaiting':'🟡 Wartend','common.pinStatusDone':'🟢 Fertig','common.pinStatusProblem':'🔴 Problem','common.measurementTypeLabel':'Messungstyp','common.wallToWall':'Wand zu Wand','common.measurementMmLabel':'Messung (mm)','common.mainNoteLabel':'Hauptnotiz','common.whatNeedsDoingPlaceholder':'Was muss hier gemacht werden?','common.photoLabel':'Foto','common.savePinBtn':'Pin speichern','common.deletePinBtn':'Pin löschen','common.conversationAtPin':'Unterhaltung an dieser Pinnadel','common.noRepliesYet':'Noch keine Antworten.','common.writeShortReplyPlaceholder':'Kurze Antwort schreiben…','common.sendBtn':'Senden','common.dragTradePinToStart':'Ziehe eine Gewerke-Pinnadel auf eine andere, um einen Gruppenchat zu starten.','common.reopen':'Wieder öffnen','common.markDone':'Als fertig markieren','common.deleteLink':'Verknüpfung löschen','common.noMessagesYet':'Noch keine Nachrichten.','common.writeShortMessagePlaceholder':'Kurze Nachricht schreiben…','common.stageWaiting':'Wartend','common.stageStarted':'Begonnen','common.stageDelayed':'Verzögert','common.stageReadyNext':'Bereit für nächstes Gewerk','common.stageComplete':'Abgeschlossen','common.addStagesHint':'Füge Phasen nur hinzu, wenn du eine Arbeitsreihenfolge benötigst.','common.tradeOrStagePrompt':'Gewerk oder Phase','common.noCustomersMatchSearch':'Keine Kunden entsprechen deiner Suche.','common.noCustomersYet':'Noch keine Kunden. Tippe auf "+ Neuer Kunde", um einen hinzuzufügen, oder sende einen Baustellenauftrag von deinem Telefon.','common.jobsCount':'{0} Auftrag/Aufträge','common.openInMapsLink':'In Maps öffnen ›','common.openPinnedLocationMaps':'📍 Angepinnten Standort in Maps öffnen ›','common.dragToTradeDbTitle':'Ziehe es in deine Gewerke-Datenbank, auf den Desktop oder in eine andere App, um eine Kopie dieses Auftrags zu speichern','common.roomFallback':'Raum','common.openArrowBtn':'Öffnen ›','common.noJobsYetCustomer':'Noch keine Aufträge für diesen Kunden.','common.siblingRoomTag':'🔗 Raum {0} von {1} aus demselben Baustellenbesuch — kein Duplikat','common.customerNotNamed':'Kunde nicht benannt','common.newSiteJob':'Neuer Baustellenauftrag','common.roomNotNamed':'Raum nicht benannt','common.newBadge':'NEU','common.noNewJobsBadge':'Keine neuen Aufträge','common.noNewSiteJobsList':'Keine neuen Baustellenaufträge','common.jobCouldNotBeRead':'⚠ Auftrag konnte nicht gelesen werden','common.jobDataCorrupted':'Die Daten dieses Auftrags sind beschädigt. Entferne ihn, damit er keine neuen Aufträge blockiert.','common.remove':'Entfernen','common.removeWithoutOpening':'Entfernen ohne zu öffnen','common.saveToCustomer':'📁 Beim Kunden speichern','common.openDrawingArrow':'Zeichnung öffnen ›','common.useBackupFile':'Sicherungsdatei verwenden','common.directSyncUnavailableUseBackup':'Direkte Synchronisierung nicht verfügbar. Verwende die Sicherungsdatei.','common.couldNotAddDrawing':'Zeichnung konnte nicht hinzugefügt werden','common.roomsArea':'Raumbereich','common.selectedFileCouldNotBeRead':'Die ausgewählte Datei konnte nicht gelesen werden.','common.openingFileCancelled':'Das Öffnen der Datei wurde abgebrochen.','common.openingFileEllipsis':'Öffne ','common.photoOrScreenshotFallback':'Foto oder Screenshot','common.fileWasEmpty':'Die Datei war leer.','common.tryAnotherPictureScreenshot':'Bitte versuche ein anderes Bild oder einen anderen Screenshot.','common.checkingClipboardForDrawing':'Zwischenablage wird nach einer Zeichnung durchsucht…','common.drawingPastedFromClipboard':'Zeichnung aus der Zwischenablage eingefügt.','common.copyDrawingThenPasteHint':'Kopiere die Zeichnung und drücke dann Strg + V. Das Zeichnungsfeld ist bereit.','common.installerNotesHeading':'Monteurnotizen','common.accessOrderPlaceholder':'Zugang, Arbeitsreihenfolge, Steckdosen, Sockelleisten oder andere Hinweise','common.inThisRoomHeading':'In diesem Raum','common.panelsTapToRemove':'Paneele · tippen zum Entfernen','common.noWardrobeCabinetYet':'Noch kein Schrank hier.','common.addWardrobeCabinetHeading':'Schrank hinzufügen','common.panelsWord':'Paneele','common.noUnassignedUnits':'Keine nicht zugewiesenen Einheiten. Füge zuerst einen Schrank hinzu oder öffne einen anderen Raum.','common.renameRoomBtn':'Raum umbenennen','common.deleteRoomBtn':'Raum löschen','common.roomNamePrompt':'Raumname:','common.wardrobeOrCabinetCount':'{0} Schrank/Schränke','common.placeUnitsBtn':'{0} Einheit(en) platzieren','common.tapRoomAddUnit':'Tippe auf einen Raum und füge dann die Einheit hinzu','common.noRoomSelectedYet':'Noch kein Raum ausgewählt. Tippe auf Raum wählen und dann auf ein Bild.','roomType.kitchen':'Küche','roomType.livingRoom':'Wohnzimmer','roomType.tvWall':'TV-Wand','roomType.masterBedroom':'Hauptschlafzimmer','roomType.bedroom':'Schlafzimmer','roomType.kidsBedroom':'Kinderzimmer','roomType.dressingRoom':'Ankleidezimmer','roomType.bathroom':'Badezimmer','roomType.office':'Büro','roomType.laundry':'Waschküche','roomType.utilityRoom':'Hauswirtschaftsraum','roomType.hallway':'Flur','roomType.underStairs':'Unter der Treppe','roomType.wineRoom':'Weinraum','roomType.library':'Bibliothek','roomType.custom':'Benutzerdefiniert','common.chooseRoomHeading':'Raum wählen','common.tapPictureRoomHelp':'Tippe auf das Bild für den Raum, an dem du arbeitest. Du kannst denselben Raumtyp mehr als einmal hinzufügen.','common.typeRoomNamePlaceholder':'Raumnamen eingeben','common.addRoomBtn':'Raum hinzufügen','common.editJobHeading':'Auftrag bearbeiten','common.jobNameLabel':'Auftragsname','common.customerLabel':'Kunde','common.cancelBtn':'Abbrechen','common.saveBtn':'Speichern','common.createOrOpenJobNote':'Erstelle einen neuen Auftrag oder öffne einen gespeicherten.','common.untitledJob':'Unbenannter Auftrag','common.addCustomer':'Kunde hinzufügen','common.editBtn':'Bearbeiten','common.chooseRoomBtn':'Raum wählen','common.continueToDrawing':'➡ Weiter zur Zeichnung','common.openDrawingBtn':'Zeichnung öffnen','common.roomsWord':'Räume','common.unitsWord':'Einheiten','common.materialsWord':'Materialien','common.piecesWord':'Stück','common.oneUnit':'1 Einheit','common.unitsCount':'{0} Einheiten','common.piecesCount':'{0} Stück','common.selectedRoomPrefix':'Ausgewählter Raum · ','common.noCustomerName':'Kein Kundenname','common.everythingReady':'Alles bereit','common.checkRedCardsBeforeSending':'Überprüfe die roten Karten vor dem Senden','common.qrPanelsTitle':'QR-Paneele','common.projectNotesTitle':'Projektnotizen','common.roomsHeading':'Räume','common.noRoomsYet':'Noch keine Räume.','common.panelsNeedMoreInfo':'⚠ {0} Paneel(e) benötigen weitere Informationen vor der Zuschnittliste.','common.noPanelsYetReturnDrawing':'Noch keine Paneele. Gehe zurück zu Zeichnung und markiere das erste Paneel.','common.panelsReadyCount':'{0} von {1} Paneelen fertig','common.longShortEdges':'{0} lange Kante(n) · {1} kurze Kante(n)','common.measurementsLabel':'Maße:','common.panelCheckedLabel':'Paneel geprüft','common.panelNotCheckedLabel':'Paneel nicht geprüft','common.doubleClickApprovePanel':'Doppelklick, um dieses Paneel zu genehmigen','common.doubleClickAfterChecking':'Doppelklick, nachdem du dieses Paneel geprüft hast','common.buildChecklistHeading':'Bau-Checkliste','common.hardwareChecklistHeading':'Beschläge-Checkliste','common.tickedOffCount':'{0} von {1} abgehakt','common.autoPickedUpHint':'Jedes Paneel, das du in der Zeichnung benennst, wird hier automatisch erfasst — keine manuelle Eingabe nötig.','common.addOwnElectricalPlaceholder':'Füge dein eigenes hinzu, z. B. Elektro-Zugangspanel','common.addOwnSoftClosePlaceholder':'Füge dein eigenes hinzu, z. B. Softclose-Dämpfer','common.addBtnPlus':'+ Hinzufügen','common.useSavedTemplateHeading':'Gespeicherte Vorlage verwenden?','common.startFromPreviousHint':'Starte diesen Schrank mit einer früheren Paneelliste oder beginne leer.','common.panelsHardwareCount':'{0} Paneel(e) · {1} Beschlag/Beschläge','common.startBlankBtn':'Leer starten','common.saveAsTemplateHeading':'Als Vorlage speichern','common.templateNameLabel':'Vorlagenname','common.templateNamePlaceholder':'z. B. Zweitüriger Schrank','common.saveTemplateBtn':'Vorlage speichern','common.edgingConfirmationNeeded':'Kantenbearbeitung und alle Details müssen bestätigt werden','common.editPanelBtn':'Paneel bearbeiten','hardware.hinges':'Scharniere','hardware.handles':'Griffe','hardware.shelfPins':'Bodenträger','hardware.ledLights':'LED-Leuchten','hardware.ledDriverTransformer':'LED-Treiber/Trafo','hardware.screwsFixings':'Schrauben & Befestigungen','common.addedOnDrawing':'In der Zeichnung hinzugefügt','common.panelSavedToast':'Paneel gespeichert','common.panelSavedNextReady':'Paneel gespeichert · Nächstes Paneel bereit','common.panelCouldNotBeSaved':'Paneel konnte nicht gespeichert werden','common.addMainInfoHint':'Füge die wichtigsten Informationen hinzu, die der Monteur sich merken sollte.','common.accessOrderSpecialPlaceholder':'Zugang, Arbeitsreihenfolge, besondere Hinweise, Beleuchtung oder anderes Wichtiges','common.saveNotesBtn':'✓ Notizen speichern','common.noWardrobeSelected':'Kein Schrank ausgewählt.','common.noCompletePartsReadySupplier':'Keine vollständigen Teile sind für den Lieferanten bereit. Füge zuerst Name, Stärke, Länge und Breite hinzu.','common.partTypeCount':'{0} Teiletyp(en)','common.partNoHeader':'Teile-Nr.','common.panelDetailsHeader':'Paneldetails','common.descWhereGoesHeader':'Beschreibung / wo es hingehört','common.noProjectSelected':'Kein Projekt ausgewählt.','common.noImageDrawingAvailable':'Kein Bildzeichnung verfügbar.','common.partHeader':'Teil','common.descriptionHeader':'Beschreibung','common.statusHeaderPlain':'Status','common.panelNotFound':'Paneel nicht gefunden','common.drawingMissingFor':'Zeichnung fehlt für {0}','common.openedOnDrawing':'{0} im markierten Zeichnung geöffnet','common.allowPopupsPrintQr':'Erlaube Pop-ups, um QR-Etiketten zu drucken','common.qrCodesGenerated':'QR-Codes generiert','nav.home':'Start','nav.customers':'Kunden','nav.qrAndScan':'QR & Scan','nav.finishJob':'Auftrag abschließen','nav.settings':'Einstellungen','drawing.saveToCustomer':'Beim Kunden speichern','jobs.newJobCustomerPrompt':'Kundenname für diesen Auftrag?','drawing.enterCustomerNamePrompt':'Für welchen Kunden ist dieser Auftrag?','common.savedToCustomerToast':'Gespeichert bei {0}'
 },
 fr:{start:'Démarrer le projet',startHelp:'Saisissez le chantier et choisissez ce que vous construisez. Les pièces restent dans le projet et sont envoyées au téléphone.',job:'Sur quoi travaillez-vous ?',summary:'Terminer le chantier',summaryHelp:'Une dernière vérification visuelle, puis enregistrez ou envoyez une note à l’équipe d’installation.',finish:'Envoyer au téléphone ou à l’iPad',noteLabel:'Note pour le téléphone',noteHint:'Envoyée séparément, indépendamment de la liste de découpe — pratique pour un message rapide sur ce chantier, à tout moment.',notePlaceholder:'Exemple : Armoire de Red — le client veut des charnières à fermeture douce, confirmer avant la pose.',noteSendBtn:'Envoyer la note au téléphone',noteSendSmall:'Juste cette note, pas besoin de liste de découpe',
  'bom.pcsShort':'pcs','bomScreen.deleteJob':'Supprimer ce chantier','bomScreen.saveProject':'Enregistrer le projet','bomScreen.saveProjectSub':'Conserver toutes les modifications de Studio','bomScreen.templateCheck':'Vérification modèle et quincaillerie','bomScreen.templateCheckSub':'Revérifiez panneaux, charnières, éclairages, rails, tiroirs et quincaillerie avant l\'envoi.',
  'customers.addCustomer':'💾 Ajouter un client','customers.address':'Adresse','customers.backToCustomers':'← Clients','customers.cancel':'Annuler','customers.delete':'🗑 Supprimer','customers.edit':'✏️ Modifier','customers.heading':'Clients','customers.name':'Nom','customers.newCustomer':'+ Nouveau client','customers.phone':'Téléphone','customers.save':'💾 Enregistrer','customers.searchPlaceholder':'Rechercher des clients...','customers.subtitle':'Chaque chantier, enregistré et organisé par client.',
  'drawing.back':'Retour','drawing.catDoors':'Portes et tiroirs','drawing.catInfills':'Remplissages','drawing.catKitchen':'Meubles de cuisine','drawing.catTv':'Murs et meubles TV','drawing.catUtility':'Utilitaire et pièces spéciales','drawing.catWardrobes':'Armoires et meubles','drawing.checkAllPanels':'✓ Vérifier tous les panneaux','drawing.chooseDrawing':'Choisir un dessin','drawing.chosenParts':'Pièces choisies','drawing.delete':'Supprimer','drawing.dropHere':'Déposez un dessin, une capture ou une photo ici','drawing.dropHereHint':'Utilisez les boutons ci-dessus, glissez un dessin dans cette zone, ou appuyez sur Ctrl + V après avoir copié une capture d\'écran.','drawing.dropHereSub':'Collez, déposez, choisissez un fichier ou prenez une photo.','drawing.edgeBandingTitle':'Double-cliquez pour ajouter un chant','drawing.edgeHelp':'Double-cliquez sur le nombre de longueur ou de largeur pour ajouter un chant : pas de ligne → une ligne → double ligne.','drawing.fit':'Ajuster','drawing.fitDrawing':'Ajuster le dessin','drawing.leftRight':'Gauche / Droite','drawing.length':'Longueur','drawing.makeUnique':'Rendre le marqueur sélectionné unique','drawing.materialChooseOnce':'Matériau — choisissez une fois pour ce chantier','drawing.materialHint':'Saisissez le nom exact du matériau utilisé pour ce chantier.','drawing.materialPrefix':'Matériau','drawing.morePartNames':'Plus de noms de pièces','drawing.noDrawing':'Aucun dessin','drawing.noPanelSelected':'Aucun panneau sélectionné','drawing.notesHint':'Ajouter ou utiliser une autre note','drawing.notesOptional':'Notes — facultatif','drawing.notesPrefix':'Notes','drawing.panelOptions':'Options du panneau','drawing.partName':'Nom de la pièce','drawing.partNamePlaceholder':'Choisissez ou tapez un nom de pièce…','drawing.partSelected':'Pièce sélectionnée','drawing.pasteDrawing':'Coller le dessin','drawing.pasteTitle':'Coller une capture d\'écran ou une image copiée','drawing.putSameNumber':'+ Mettre le même numéro sur le dessin','drawing.quantity':'Quantité','drawing.samePanelMarkers':'Mêmes marqueurs de panneau :','drawing.saveMaterial':'Enregistrer le matériau','drawing.saveNext':'Enregistrer et suivant','drawing.thickness':'Épaisseur','drawing.topBottom':'Haut / Bas','drawing.width':'Largeur','drawing.zoomIn':'Zoom avant','drawing.zoomOut':'Zoom arrière',
  'home.addLabel':'Ajouter','home.addUnitBelow':'Ajoutez l\'unité correcte ci-dessous.','home.addWardrobe':'+ Ajouter une armoire ou un meuble','home.back':'← Retour','home.back2':'Retour','home.backHome':'← Accueil','home.chooseRoomHeading':'Choisir une pièce','home.chooseRoomHint':'Touchez un grand bouton image. La pièce reste dans ce projet et est envoyée automatiquement au téléphone.','home.chooseRoomHint2':'Choisissez une pièce ci-dessus, puis ajoutez le meuble correct pour cette pièce.','home.continueJob':'Continuer le chantier actuel','home.currentJobFallback':'Chantier actuel','home.customerLabel':'Client','home.customerPlaceholder':'Nom du client','home.customersJobs':'Clients et chantiers','home.customersJobsSub':'Voir tous les clients et leurs projets','home.jobNameHint':'Nommez le chantier une fois, puis choisissez la pièce sur laquelle vous travaillez.','home.jobNameLabel':'Nom du chantier','home.jobNamePlaceholder':'ex. Maison de Simone','home.newProject':'Nouveau projet','home.newProjectSub':'Démarrer un nouveau client ou projet','home.openJobHint':'Ouvrez le chantier sur lequel vous travaillez','home.recentJobs':'Chantiers récents','home.recentJobsSub':'Vos chantiers récemment ouverts','home.saveTemplateLater':'＋ Enregistrer un nouveau modèle plus tard','home.selectedRoomPrefix':'Pièce sélectionnée :','home.siteJobs':'Chantiers','home.siteJobsNew':'Nouveaux chantiers envoyés depuis votre téléphone','home.siteJobsSub':'Photos et mesures depuis votre téléphone','home.templateFourDoor':'Armoire à quatre portes','home.templateReady':'Prêt pour votre checklist enregistrée','home.templateThreeSliding':'Armoire à trois portes coulissantes','home.templatesHeading':'🗂️ Mes modèles','home.templatesSub':'Votre bibliothèque personnalisée vivra ici.','home.unitCabinet':'meuble','home.unitKitchen':'meuble de cuisine','home.unitLivingRoom':'meuble de salon','home.unitOffice':'meuble de bureau','home.unitTvWall':'mur TV','home.unitUnderStairs':'meuble sous escalier','home.unitWardrobeOrCabinet':'armoire ou meuble','home.viewAll':'Tout voir','home.welcomeSubtitle':'Planifiez, concevez et gérez vos projets facilement.','home.welcomeTitle':'Bienvenue sur AssembleOne Studio 👋','home.whatBuilding':'Que construisez-vous ?',
  'parts.heading':'Vérification des panneaux','parts.subtitle':'Vérifiez chaque panneau avant de créer la liste de découpe.',
  'phoneScreen.heading':'Guide des pièces','phoneScreen.part':'Pièce','phoneScreen.subtitle':'Le panneau sélectionné est mis en surbrillance.',
  'qrScreen.generate':'Générer des codes QR','qrScreen.heading':'Étiquettes QR — armoire sélectionnée uniquement','qrScreen.print':'Imprimer les étiquettes QR','qrScreen.smartQr':'QR intelligent :','qrScreen.smartQrBody':'Scannez dans AssembleOne pour ouvrir exactement le panneau mis en surbrillance. Lorsque l\'application mobile a une adresse web publique, collez-la ci-dessous et la caméra normale du téléphone pourra aussi ouvrir le panneau directement.','qrScreen.subtitle':'Les codes QR d\'autres chantiers et armoires sont conservés séparément.','qrScreen.webAddress':'Adresse web de l\'application mobile','qrScreen.webAddressHint':'Laissez ceci vide pendant les tests locaux. Puis scannez avec le scanner dans AssembleOne Mobile. Le projet publié doit déjà être ouvert sur le téléphone ou l\'iPad.',
  'settingsScreen.appData':'Données de l\'application','settingsScreen.appDataHint':'Supprimez tous les chantiers, dessins et paramètres enregistrés sur cet appareil. Ceci ne peut pas être annulé.','settingsScreen.clearData':'Effacer toutes les données de cet appareil','settingsScreen.cloudSync':'Synchronisation cloud','settingsScreen.cloudSyncHint':'Cet appareil se synchronise automatiquement avec l\'application téléphone via le cloud. Aucune connexion requise.','settingsScreen.heading':'Paramètres','settingsScreen.language':'Langue','settingsScreen.languageHint':'Utilisez le menu des drapeaux en haut de l\'écran pour changer la langue de l\'application.','settingsScreen.subtitle':'Préférences de l\'application et synchronisation.','settingsScreen.unitCm':'Centimètres (cm)','settingsScreen.unitIn':'Pouces (in)','settingsScreen.unitMm':'Millimètres (mm)','settingsScreen.units':'Unités de mesure','settingsScreen.unitsHint':'Choisissez comment les tailles de panneaux sont affichées et saisies sur l\'écran de dessin.',
  sitePlanner:'Planificateur de chantier','siteScreen.addFloorPlan':'Ajoutez un plan ou une photo de chantier. Puis choisissez un corps de métier ci-dessus et touchez le plan.','siteScreen.addMeasurement':'↔ Mesure','siteScreen.addPlan':'Ajouter / changer le plan de chantier','siteScreen.addWorkStage':'+ Étape de travail','siteScreen.chooseTrade':'Choisissez un corps de métier, puis touchez l\'endroit exact sur le plan','siteScreen.chooseTradeMessage':'Choisissez un corps de métier et envoyez un message de projet.','siteScreen.pinHint':'L\'épingle devient une petite conversation pour tous ceux qui travaillent à cet endroit.','siteScreen.selectedPin':'Épingle sélectionnée','siteScreen.showTrades':'Afficher les corps de métier','siteScreen.subtitle':'Placez travail, notes et conversations directement sur le plan ou la photo du chantier.','siteScreen.tapPin':'Touchez une épingle sur le plan.','siteScreen.tapPinHint':'Touchez une épingle pour lire ou répondre. Touchez un endroit vide après avoir choisi un corps de métier pour ajouter une nouvelle épingle.','siteScreen.tradeMessages':'Messages par métier','siteScreen.workOrder':'Ordre de travail',
  "partname.Adjustable shelf":"Étagère réglable","partname.Appliance panel":"Panneau électroménager","partname.Back panel":"Panneau arrière","partname.Base bottom":"Dessous meuble bas","partname.Base shelf":"Étagère meuble bas","partname.Base side":"Côté meuble bas","partname.Base top":"Dessus meuble bas","partname.Batten":"Tasseau","partname.Bench top":"Plateau banc","partname.Book shelf":"Étagère à livres","partname.Bottom":"Dessous","partname.Bottom infill":"Remplissage bas","partname.Bracket":"Équerre","partname.Cable panel":"Panneau câbles","partname.Centre divider":"Séparateur central","partname.Cleat":"Taquet","partname.Clip":"Clip","partname.Cover panel":"Panneau de finition","partname.Custom panel":"Panneau personnalisé","partname.Desk side":"Côté bureau","partname.Desk top":"Plateau bureau","partname.Dishwasher panel":"Panneau lave-vaisselle","partname.Divider":"Séparateur","partname.Door":"Porte","partname.Drawer back":"Fond arrière de tiroir","partname.Drawer bottom":"Fond de tiroir","partname.Drawer divider":"Séparateur de tiroir","partname.Drawer front":"Façade de tiroir","partname.Drawer side":"Côté de tiroir","partname.Drawer support":"Support de tiroir","partname.Dryer shelf":"Étagère sèche-linge","partname.End panel":"Panneau de fin","partname.Filler panel":"Panneau de remplissage","partname.Fireplace panel":"Panneau cheminée","partname.Fixed shelf":"Étagère fixe","partname.Fridge panel":"Panneau réfrigérateur","partname.Glass shelf":"Étagère en verre","partname.Handle":"Poignée","partname.Hanging rail":"Tringle","partname.Hob rail":"Traverse plaque","partname.Infill":"Panneau de remplissage","partname.Kickboard":"Plinthe","partname.LED profile":"Profilé LED","partname.Left door":"Porte gauche","partname.Left infill":"Remplissage gauche","partname.Left-hand side":"Côté gauche","partname.Light panel":"Panneau lumineux","partname.Mirror panel":"Panneau miroir","partname.Modesty panel":"Panneau de protection","partname.Oven rail":"Traverse four","partname.Pair of doors":"Paire de portes","partname.Plinth":"Socle","partname.Pocket door":"Porte escamotable","partname.Printer shelf":"Étagère imprimante","partname.Right door":"Porte droite","partname.Right infill":"Remplissage droit","partname.Right-hand side":"Côté droit","partname.Scribe panel":"Panneau d'ajustage","partname.Seat top":"Plateau assise","partname.Shelf":"Étagère","partname.Side":"Côté","partname.Side panel":"Panneau latéral","partname.Sink rail":"Traverse évier","partname.Slatted panel":"Panneau à claire-voie","partname.Sliding door":"Porte coulissante","partname.Speaker shelf":"Étagère enceinte","partname.Splashback":"Crédence","partname.Support":"Support","partname.TV divider":"Séparateur TV","partname.TV panel":"Panneau TV","partname.TV shelf":"Étagère TV","partname.TV side":"Côté TV","partname.TV top":"Dessus TV","partname.Tall cabinet side":"Côté colonne","partname.Toe kick":"Socle plinthe","partname.Top":"Dessus","partname.Top and bottom":"Dessus et dessous","partname.Top infill":"Remplissage haut","partname.Utility shelf":"Étagère buanderie","partname.Wall cabinet bottom":"Dessous meuble haut","partname.Wall cabinet side":"Côté meuble haut","partname.Wall cabinet top":"Dessus meuble haut","partname.Wall shelf":"Étagère murale","partname.Washer shelf":"Étagère lave-linge","partname.Wine shelf":"Étagère à vin","partname.Worktop":"Plan de travail",
  'msg.noSitePicture':"Aucune photo de chantier n'est disponible.",'msg.sitePhotoBesideDrawing':'La photo du chantier est maintenant à côté des outils de dessin, comme référence.','msg.confirmDeleteWardrobe':'Supprimer ce meuble et toutes ses pièces ?','msg.openProjectFirst':"Ouvre d'abord un projet.",'msg.confirmDeleteRoomUnassigned':'Supprimer la pièce "{0}" ? Les meubles deviendront non assignés.','msg.jobSaved':'Chantier enregistré.','msg.projectNotFound':'Projet introuvable.','msg.enterCustomerName':'Saisis un nom de client.','msg.customerAlreadyExists':'"{0}" existe déjà.','msg.confirmDeleteCustomer':'Supprimer "{0}" ?\n\nCette action est irréversible.','msg.confirmDeleteCustomerAndJobs':'Supprimer "{0}" et {1} chantier(s) ?\n\nCette action est irréversible.','msg.siteUpdatesImported':"Mises à jour de chantier importées. Le statut d'installation, les notes et les photos sont de retour dans Studio.",'msg.notValidSiteUpdateZip':"Ce n'est pas un ZIP de mise à jour de chantier AssembleOne valide.",'msg.confirmDeleteWithoutSaving':"Supprimer \"{0}\" sans l'enregistrer nulle part ?\n\nCette action est irréversible.",'msg.siteJobNoLongerWaiting':"Ce chantier n'est plus en attente.",'msg.savedToCustomerJobs':'Enregistré dans les chantiers de {0} — à retrouver à tout moment depuis Mes projets.','msg.couldNotSaveJobTryDrawing':"Impossible d'enregistrer ce chantier. Essaie plutôt Ouvrir le dessin.",'msg.noNewSiteJobsWaiting':'Aucun nouveau chantier en attente.','msg.dropZipToReopen':'Dépose un fichier .zip de chantier AssembleOne pour le rouvrir.','msg.siteJobOpenedDrawing':'Chantier ouvert dans Dessin. La photo mesurée est prête comme référence.','msg.directSyncNotAvailableBackup':"La synchronisation directe n'est pas disponible ici. Utilise Ouvrir le fichier de sauvegarde.",'msg.projectOpenedInStudio':'Projet ouvert dans AssembleOne Studio.','msg.notValidProjectZip':"Ce n'est pas un ZIP de projet AssembleOne valide.",'msg.choosePictureScreenshotPdf':"Choisis une image, une capture d'écran ou un fichier PDF.",'msg.drawingTooLargeStorage':'Le dessin s\'affiche correctement, mais il est trop volumineux pour le stockage permanent du navigateur. Garde cette page ouverte pendant que tu travailles, ou utilise une capture plus petite.','msg.drawingCouldNotOpen':"Le dessin n'a pas pu être ouvert.",'msg.notPictureFileTryDragging':"Cet élément n'est pas un fichier image. Essaie de glisser un PNG ou un JPG depuis ton dossier Téléchargements ou Images.",'msg.forMarkingPanelsUsePngJpg':'Pour marquer les panneaux, utilise une capture PNG ou JPG du PDF.','msg.confirmDeletePanel':'Supprimer {0} ?','msg.markOrSelectPanelFirst':"Marque ou sélectionne d'abord un panneau.",'msg.markPanelFirst':"Marque d'abord un panneau.",'msg.choosePanelFirst':"Choisis d'abord un panneau.",'msg.allMarkersAlreadyOnDrawing':'Les {0} repères sont déjà sur le dessin.','msg.setQuantityFirst':"Mets d'abord la Quantité au-dessus de 1, puis utilise ceci pour placer un repère pour chacun à la fois.",'msg.addedMoreMarkers':'{0} repère(s) supplémentaire(s) ajouté(s), donc les {1} sont maintenant sur le dessin. Fais glisser chacun à son véritable emplacement, puis scanne son propre code QR une fois posé.','msg.selectRepeatedMarkerFirst':"Sélectionne d'abord l'un des repères répétés.",'msg.noCompletePartsReady':"Aucune pièce complète n'est prête. Ajoute d'abord le nom de la pièce, l'épaisseur, la longueur et la largeur.",'msg.confirmRemovePin':'Retirer cette épingle ?','msg.confirmRemoveLinkedGroupChat':'Retirer cette discussion de groupe liée ?','msg.finishAllSectionsFirst':"Termine d'abord Démarrage, Dessin, Panneaux, Liste de découpe et Étiquettes QR. Chaque case deviendra verte quand elle sera prête.",'msg.dropValidFileTypes':'Dépose ici un fichier PNG, JPG, WEBP ou PDF.','msg.printPreviewCouldNotOpen':"L'aperçu avant impression n'a pas pu s'ouvrir. Réessaie.",'msg.noCompletePanelsToPrint':"Aucun panneau complet n'est prêt à être imprimé.",'msg.generateQrCodesFirst':"Génère d'abord les codes QR.",'msg.openJobFirst':"Ouvre d'abord un chantier.",'msg.nothingSentNoUnit':"Rien n'a été envoyé car ce chantier n'a pas encore d'unité.",'msg.nothingSentNoPanels':"Rien n'a été envoyé car ce chantier n'a pas encore de panneaux.",'msg.confirmPanelsNotChecked':"{0} panneau(x) n'ont pas encore été vérifiés (détails manquants ou non relus). Envoyer quand même ?",'msg.cuttingListSent':'Liste de découpe envoyée : {0} panneaux et {1} pièces.','msg.siteJobSent':'Chantier envoyé : {0} pièce, {1} unité, {2} panneaux et {3} pièces.','msg.phoneConnectionFailed':'La connexion au téléphone a échoué. Vérifie que les deux appareils ont internet et réessaie.','msg.typeNoteFirst':"Écris d'abord une note.",'msg.confirmClearAllData':'Ceci supprime tous les chantiers, dessins et paramètres enregistrés sur cet appareil. Cette action est irréversible. Continuer ?','msg.addPanelBeforeTemplate':"Ajoute au moins un panneau avant d'enregistrer un modèle.",'msg.pleaseAddMissing':'Merci d\'ajouter : {0}','msg.samePartNumberAdded':'Le même numéro de pièce a été ajouté à nouveau. Faites glisser le nouveau repère vers le panneau correspondant.','msg.confirmDeleteJobBase':'Supprimer "{0}" ?\n\nCela supprime définitivement toutes les armoires, tous les dessins, panneaux, listes de découpe, étiquettes QR -- ET toutes les photos ou mesures enregistrées pour ce travail.','msg.confirmDeleteJobPhotos':'\n\nCe travail comporte {0} photo(s) enregistrée(s). Elles seront perdues sauf si le téléphone les possède encore et que vous les renvoyez.','msg.confirmDeleteJobSibling':"\n\n⚠️ Cela ressemble à la pièce {0} sur {1} de la même visite de chantier ({2}) -- assurez-vous qu'il s'agit bien de celle que vous voulez supprimer, et non d'une pièce confondue avec un doublon.",'home.tagline':'Pièces · Listes de découpe · Panneaux QR','status.ready':'Prêt','status.installed':'Installé','status.missing':'Manquant','status.damaged':'Endommagé','common.unnamedPart':'Pièce sans nom','common.notSet':'Non défini','common.qty':'Qté','common.noPanelsMarked':'Aucun panneau marqué pour le moment.','common.material':'Matériau:','common.edging':'Chants:','common.notes':'Notes:','common.status':'Statut:','common.choosePartName':'Choisir le nom de la pièce','common.testQr':'Tester le QR','common.notTestedYet':'Pas encore testé','common.noPartsInWardrobe':'Aucune pièce dans cette armoire.','common.markerXOfY':'repère {0} sur {1}','common.doubleClickTickOff':'double-cliquez pour cocher','common.noCompleteComponentsYet':"Aucun composant complet pour l'instant. Terminez d'abord le nom et toutes les mesures.",'step.start':'Début','step.drawing':'Dessin','step.panels':'Panneaux','step.cuttingList':'Liste de découpe','step.qrLabels':'Étiquettes QR','step.finish':'Terminer','common.completeFirstFiveStages':"Terminez les cinq premières étapes avant d'envoyer le projet",'common.openThisSection':'Ouvrir cette section','common.sendCompletedProjectPhone':"Envoyer le projet terminé au téléphone ou à l'iPad",'common.completeAllFiveStepsFirst':"Terminez d'abord les cinq étapes précédentes",'common.readyToSend':'Prêt à envoyer','common.completeEveryStepFirst':"Terminez d'abord toutes les étapes",'common.completeSuffix':' terminé','common.notCompleteSuffix':' non terminé','common.openStepPrefix':'Ouvrir ','common.panelCheck':'Vérification des panneaux','trade.builder':'Constructeur','trade.bricklayer':'Maçon','trade.carpenter':'Charpentier','trade.electrician':'Électricien','trade.plumber':'Plombier','trade.decorator':'Peintre','trade.flooring':'Sols','trade.wardrobes':'Armoires','trade.kitchenInstaller':'Installateur de cuisine','trade.tiler':'Carreleur','trade.hvac':'Climatisation/CVC','trade.heating':'Chauffage','trade.windows':'Fenêtres','trade.doors':'Portes','trade.roofer':'Couvreur','trade.steelworker':'Métallier','trade.landscaper':'Paysagiste','trade.supplier':'Fournisseur','trade.client':'Client','trade.other':'Autre','trade.measurement':'Mesure','common.move':'Déplacer','common.done':'Terminé','common.delete':'Supprimer','common.messagePrefix':'Message à ','common.tapPinOnPlan':'Touchez une épingle sur le plan.','common.tradeLabel':'Métier','common.roomAreaLabel':'Pièce / zone','common.bathroomExample':'Salle de bain','common.statusLabel':'Statut','common.pinStatusNew':'⚪ Nouveau','common.pinStatusWaiting':'🟡 En attente','common.pinStatusDone':'🟢 Terminé','common.pinStatusProblem':'🔴 Problème','common.measurementTypeLabel':'Type de mesure','common.wallToWall':'Mur à mur','common.measurementMmLabel':'Mesure (mm)','common.mainNoteLabel':'Note principale','common.whatNeedsDoingPlaceholder':'Que faut-il faire ici ?','common.photoLabel':'Photo','common.savePinBtn':"Enregistrer l'épingle",'common.deletePinBtn':"Supprimer l'épingle",'common.conversationAtPin':'Conversation sur cette épingle','common.noRepliesYet':'Aucune réponse pour le moment.','common.writeShortReplyPlaceholder':'Écrire une courte réponse…','common.sendBtn':'Envoyer','common.dragTradePinToStart':'Faites glisser une épingle de métier sur une autre pour démarrer une discussion de groupe.','common.reopen':'Rouvrir','common.markDone':'Marquer comme terminé','common.deleteLink':'Supprimer le lien','common.noMessagesYet':'Aucun message pour le moment.','common.writeShortMessagePlaceholder':'Écrire un court message…','common.stageWaiting':'En attente','common.stageStarted':'Commencé','common.stageDelayed':'Retardé','common.stageReadyNext':'Prêt pour le métier suivant','common.stageComplete':'Terminé','common.addStagesHint':"Ajoutez des étapes uniquement si vous avez besoin d'un ordre de travail.",'common.tradeOrStagePrompt':'Métier ou étape','common.noCustomersMatchSearch':'Aucun client ne correspond à votre recherche.','common.noCustomersYet':'Aucun client pour le moment. Appuyez sur "+ Nouveau client" pour en ajouter un, ou envoyez un chantier depuis votre téléphone.','common.jobsCount':'{0} chantier(s)','common.openInMapsLink':'Ouvrir dans Maps ›','common.openPinnedLocationMaps':"📍 Ouvrir l'emplacement épinglé dans Maps ›",'common.dragToTradeDbTitle':'Faites glisser vers votre base de données de métiers, le bureau ou une autre application pour enregistrer une copie de ce chantier','common.roomFallback':'Pièce','common.openArrowBtn':'Ouvrir ›','common.noJobsYetCustomer':'Aucun chantier pour ce client pour le moment.','common.siblingRoomTag':'🔗 Pièce {0} sur {1} de la même visite de chantier — pas un doublon','common.customerNotNamed':'Client sans nom','common.newSiteJob':'Nouveau chantier','common.roomNotNamed':'Pièce sans nom','common.newBadge':'NOUVEAU','common.noNewJobsBadge':'Aucun nouveau chantier','common.noNewSiteJobsList':'Aucun nouveau chantier','common.jobCouldNotBeRead':"⚠ Le chantier n'a pas pu être lu",'common.jobDataCorrupted':"Les données de ce chantier sont corrompues. Supprimez-le pour qu'il ne bloque pas les nouveaux chantiers.",'common.remove':'Retirer','common.removeWithoutOpening':'Retirer sans ouvrir','common.saveToCustomer':'📁 Enregistrer chez le client','common.openDrawingArrow':'Ouvrir le dessin ›','common.useBackupFile':'Utiliser le fichier de sauvegarde','common.directSyncUnavailableUseBackup':'Synchronisation directe indisponible. Utilisez le fichier de sauvegarde.','common.couldNotAddDrawing':"Impossible d'ajouter le dessin",'common.roomsArea':'Zone des pièces','common.selectedFileCouldNotBeRead':"Le fichier sélectionné n'a pas pu être lu.",'common.openingFileCancelled':"L'ouverture du fichier a été annulée.",'common.openingFileEllipsis':'Ouverture de ','common.photoOrScreenshotFallback':"photo ou capture d'écran",'common.fileWasEmpty':'Le fichier était vide.','common.tryAnotherPictureScreenshot':"Veuillez essayer une autre image ou capture d'écran.",'common.checkingClipboardForDrawing':'Vérification du presse-papiers pour un dessin…','common.drawingPastedFromClipboard':'Dessin collé depuis le presse-papiers.','common.copyDrawingThenPasteHint':'Copiez le dessin, puis appuyez sur Ctrl + V. La zone de dessin est prête.','common.installerNotesHeading':"Notes pour l'installateur",'common.accessOrderPlaceholder':'Accès, ordre de travail, prises, plinthes ou autres instructions','common.inThisRoomHeading':'Dans cette pièce','common.panelsTapToRemove':'panneaux · touchez pour retirer','common.noWardrobeCabinetYet':'Aucune armoire ici pour le moment.','common.addWardrobeCabinetHeading':'Ajouter une armoire','common.panelsWord':'panneaux','common.noUnassignedUnits':"Aucune unité non attribuée. Ajoutez d'abord une armoire ou ouvrez une autre pièce.",'common.renameRoomBtn':'Renommer la pièce','common.deleteRoomBtn':'Supprimer la pièce','common.roomNamePrompt':'Nom de la pièce :','common.wardrobeOrCabinetCount':'{0} armoire(s)','common.placeUnitsBtn':'Placer {0} unité(s)','common.tapRoomAddUnit':"Touchez une pièce, puis ajoutez l'unité",'common.noRoomSelectedYet':'Aucune pièce sélectionnée pour le moment. Appuyez sur Choisir la pièce et touchez une image.','roomType.kitchen':'Cuisine','roomType.livingRoom':'Salon','roomType.tvWall':'Mur TV','roomType.masterBedroom':'Chambre principale','roomType.bedroom':'Chambre','roomType.kidsBedroom':'Chambre enfant','roomType.dressingRoom':'Dressing','roomType.bathroom':'Salle de bain','roomType.office':'Bureau','roomType.laundry':'Buanderie','roomType.utilityRoom':'Local technique','roomType.hallway':'Couloir','roomType.underStairs':"Sous l'escalier",'roomType.wineRoom':'Cave à vin','roomType.library':'Bibliothèque','roomType.custom':'Personnalisé','common.chooseRoomHeading':'Choisir la pièce','common.tapPictureRoomHelp':'Touchez la photo de la pièce sur laquelle vous travaillez. Vous pouvez ajouter le même type de pièce plusieurs fois.','common.typeRoomNamePlaceholder':'Saisissez le nom de la pièce','common.addRoomBtn':'Ajouter une pièce','common.editJobHeading':'Modifier le chantier','common.jobNameLabel':'Nom du chantier','common.customerLabel':'Client','common.cancelBtn':'Annuler','common.saveBtn':'Enregistrer','common.createOrOpenJobNote':'Créez un nouveau chantier ou ouvrez-en un enregistré.','common.untitledJob':'Chantier sans titre','common.addCustomer':'Ajouter un client','common.editBtn':'Modifier','common.chooseRoomBtn':'Choisir la pièce','common.continueToDrawing':'➡ Continuer vers le dessin','common.openDrawingBtn':'Ouvrir le dessin','common.roomsWord':'pièces','common.unitsWord':'unités','common.materialsWord':'matériaux','common.piecesWord':'éléments','common.oneUnit':'1 unité','common.unitsCount':'{0} unités','common.piecesCount':'{0} éléments','common.selectedRoomPrefix':'Pièce sélectionnée · ','common.noCustomerName':'Aucun nom de client','common.everythingReady':'Tout est prêt','common.checkRedCardsBeforeSending':"Vérifiez les cartes rouges avant d'envoyer",'common.qrPanelsTitle':'Panneaux QR','common.projectNotesTitle':'Notes du projet','common.roomsHeading':'Pièces','common.noRoomsYet':'Aucune pièce pour le moment.','common.panelsNeedMoreInfo':"⚠ {0} panneau(x) nécessite(nt) plus d'informations avant la liste de découpe.",'common.noPanelsYetReturnDrawing':'Aucun panneau pour le moment. Retournez à Dessin et marquez le premier panneau.','common.panelsReadyCount':'{0} panneau(x) sur {1} prêt(s)','common.longShortEdges':'{0} chant(s) long(s) · {1} chant(s) court(s)','common.measurementsLabel':'Mesures:','common.panelCheckedLabel':'Panneau vérifié','common.panelNotCheckedLabel':'Panneau non vérifié','common.doubleClickApprovePanel':'Double-cliquez pour approuver ce panneau','common.doubleClickAfterChecking':'Double-cliquez après avoir vérifié ce panneau','common.buildChecklistHeading':'Liste de fabrication','common.hardwareChecklistHeading':'Liste de quincaillerie','common.tickedOffCount':'{0} sur {1} coché(s)','common.autoPickedUpHint':'Chaque panneau que vous nommez sur le dessin apparaît ici automatiquement — pas besoin de le saisir.','common.addOwnElectricalPlaceholder':"Ajoutez le vôtre, ex. Trappe d'accès électrique",'common.addOwnSoftClosePlaceholder':'Ajoutez le vôtre, ex. Amortisseurs soft-close','common.addBtnPlus':'+ Ajouter','common.useSavedTemplateHeading':'Utiliser un modèle enregistré ?','common.startFromPreviousHint':"Démarrez cette armoire à partir d'une liste de panneaux précédente, ou commencez vierge.",'common.panelsHardwareCount':'{0} panneau(x) · {1} accessoire(s)','common.startBlankBtn':'Commencer vierge','common.saveAsTemplateHeading':'Enregistrer comme modèle','common.templateNameLabel':'Nom du modèle','common.templateNamePlaceholder':'ex. Armoire à deux portes','common.saveTemplateBtn':'Enregistrer le modèle','common.edgingConfirmationNeeded':'Les chants et tous les détails doivent être confirmés','common.editPanelBtn':'Modifier le panneau','hardware.hinges':'Charnières','hardware.handles':'Poignées','hardware.shelfPins':"Taquets d'étagère",'hardware.ledLights':'Éclairage LED','hardware.ledDriverTransformer':'Alimentation/transformateur LED','hardware.screwsFixings':'Vis et fixations','common.addedOnDrawing':'Ajouté sur le dessin','common.panelSavedToast':'Panneau enregistré','common.panelSavedNextReady':'Panneau enregistré · Panneau suivant prêt','common.panelCouldNotBeSaved':"Le panneau n'a pas pu être enregistré",'common.addMainInfoHint':"Ajoutez les principales informations que l'installateur doit retenir.",'common.accessOrderSpecialPlaceholder':'Accès, ordre de travail, instructions spéciales, éclairage ou tout autre élément important','common.saveNotesBtn':'✓ Enregistrer les notes','common.noWardrobeSelected':'Aucune armoire sélectionnée.','common.noCompletePartsReadySupplier':"Aucune pièce complète n'est prête pour le fournisseur. Ajoutez d'abord le nom, l'épaisseur, la longueur et la largeur.",'common.partTypeCount':'{0} type(s) de pièce','common.partNoHeader':'N° de pièce','common.panelDetailsHeader':'Détails du panneau','common.descWhereGoesHeader':'Description / emplacement','common.noProjectSelected':'Aucun projet sélectionné.','common.noImageDrawingAvailable':'Aucun dessin image disponible.','common.partHeader':'Pièce','common.descriptionHeader':'Description','common.statusHeaderPlain':'Statut','common.panelNotFound':'Panneau introuvable','common.drawingMissingFor':'Dessin manquant pour {0}','common.openedOnDrawing':'{0} ouvert sur le dessin surligné','common.allowPopupsPrintQr':'Autorisez les pop-ups pour imprimer les étiquettes QR','common.qrCodesGenerated':'Codes QR générés','nav.home':'Accueil','nav.customers':'Clients','nav.qrAndScan':'QR et scan','nav.finishJob':'Terminer le chantier','nav.settings':'Paramètres','drawing.saveToCustomer':'Enregistrer chez le client','jobs.newJobCustomerPrompt':'Nom du client pour ce chantier ?','drawing.enterCustomerNamePrompt':'Pour quel client est ce chantier ?','common.savedToCustomerToast':'Enregistré chez {0}'
 },
 ro:{start:'Începe proiectul',startHelp:'Introdu lucrarea și alege ce construiești. Camerele rămân în proiect și sunt trimise pe telefon.',job:'La ce lucrezi?',summary:'Finalizează lucrarea',summaryHelp:'O ultimă verificare vizuală, apoi salvează sau trimite o notă echipei de instalare.',finish:'Trimite pe telefon sau iPad',noteLabel:'Notă pentru telefon',noteHint:'Se trimite separat de lista de debitare — util pentru un mesaj rapid despre această lucrare, în orice etapă.',notePlaceholder:'Exemplu: Dulapul lui Red — clientul vrea balamale cu închidere lentă, confirmă înainte de montaj.',noteSendBtn:'Trimite nota pe telefon',noteSendSmall:'Doar această notă, fără nevoie de listă de debitare',
  'bom.pcsShort':'buc','bomScreen.deleteJob':'Șterge această lucrare','bomScreen.saveProject':'Salvează proiectul','bomScreen.saveProjectSub':'Păstrează toate modificările din Studio','bomScreen.templateCheck':'Verificare șablon și feronerie','bomScreen.templateCheckSub':'Verifică din nou panourile, balamalele, luminile, șinele, sertarele și feroneria înainte de trimitere.',
  'customers.addCustomer':'💾 Adaugă client','customers.address':'Adresă','customers.backToCustomers':'← Clienți','customers.cancel':'Anulează','customers.delete':'🗑 Șterge','customers.edit':'✏️ Editează','customers.heading':'Clienți','customers.name':'Nume','customers.newCustomer':'+ Client nou','customers.phone':'Telefon','customers.save':'💾 Salvează','customers.searchPlaceholder':'Caută clienți...','customers.subtitle':'Fiecare lucrare, salvată și organizată pe client.',
  'drawing.back':'Înapoi','drawing.catDoors':'Uși și sertare','drawing.catInfills':'Umpluturi','drawing.catKitchen':'Mobilier de bucătărie','drawing.catTv':'Pereți și mobilier TV','drawing.catUtility':'Utilitate și piese speciale','drawing.catWardrobes':'Dulapuri și șifoniere','drawing.checkAllPanels':'✓ Verifică toate panourile','drawing.chooseDrawing':'Alege desenul','drawing.chosenParts':'Piese alese','drawing.delete':'Șterge','drawing.dropHere':'Plasează un desen, captură sau fotografie aici','drawing.dropHereHint':'Folosește butoanele de mai sus, trage un desen în această casetă, sau apasă Ctrl + V după copierea unei capturi.','drawing.dropHereSub':'Lipește, plasează, alege un fișier sau fă o fotografie.','drawing.edgeBandingTitle':'Dublu clic pentru a adăuga cant','drawing.edgeHelp':'Dă dublu clic pe numărul de lungime sau lățime pentru a adăuga cant: fără linie → o linie → linie dublă.','drawing.fit':'Potrivește','drawing.fitDrawing':'Potrivește desenul','drawing.leftRight':'Stânga / Dreapta','drawing.length':'Lungime','drawing.makeUnique':'Fă marcajul selectat unic','drawing.materialChooseOnce':'Material — alege o dată pentru această lucrare','drawing.materialHint':'Introdu numele exact al materialului folosit pentru această lucrare.','drawing.materialPrefix':'Material','drawing.morePartNames':'Mai multe nume de piese','drawing.noDrawing':'Fără desen','drawing.noPanelSelected':'Niciun panou selectat','drawing.notesHint':'Adaugă sau folosește altă notă','drawing.notesOptional':'Note — opțional','drawing.notesPrefix':'Note','drawing.panelOptions':'Opțiuni panou','drawing.partName':'Nume piesă','drawing.partNamePlaceholder':'Alege sau scrie un nume de piesă…','drawing.partSelected':'Piesă selectată','drawing.pasteDrawing':'Lipește desenul','drawing.pasteTitle':'Lipește o captură sau imagine copiată','drawing.putSameNumber':'+ Pune același număr pe desen','drawing.quantity':'Cantitate','drawing.samePanelMarkers':'Aceleași marcaje de panou:','drawing.saveMaterial':'Salvează materialul','drawing.saveNext':'Salvează și următorul','drawing.thickness':'Grosime','drawing.topBottom':'Sus / Jos','drawing.width':'Lățime','drawing.zoomIn':'Mărește','drawing.zoomOut':'Micșorează',
  'home.addLabel':'Adaugă','home.addUnitBelow':'Adaugă unitatea corectă mai jos.','home.addWardrobe':'+ Adaugă dulap sau șifonier','home.back':'← Înapoi','home.back2':'Înapoi','home.backHome':'← Acasă','home.chooseRoomHeading':'Alege camera','home.chooseRoomHint':'Atinge un buton mare cu imagine. Camera rămâne în acest proiect și este trimisă automat pe telefon.','home.chooseRoomHint2':'Alege o cameră mai sus, apoi adaugă mobilierul corect pentru acea cameră.','home.continueJob':'Continuă lucrarea curentă','home.currentJobFallback':'Lucrarea curentă','home.customerLabel':'Client','home.customerPlaceholder':'Numele clientului','home.customersJobs':'Clienți și lucrări','home.customersJobsSub':'Vezi toți clienții și proiectele lor','home.jobNameHint':'Denumește lucrarea o dată, apoi alege camera la care lucrezi.','home.jobNameLabel':'Numele lucrării','home.jobNamePlaceholder':'ex. Casa lui Simone','home.newProject':'Proiect nou','home.newProjectSub':'Începe un client sau proiect nou','home.openJobHint':'Deschide lucrarea la care lucrezi','home.recentJobs':'Lucrări recente','home.recentJobsSub':'Lucrările tale deschise recent','home.saveTemplateLater':'＋ Salvează un șablon nou mai târziu','home.selectedRoomPrefix':'Camera selectată:','home.siteJobs':'Lucrări pe șantier','home.siteJobsNew':'Lucrări noi trimise de pe telefonul tău','home.siteJobsSub':'Fotografii și măsurători de pe telefonul tău','home.templateFourDoor':'Dulap cu patru uși','home.templateReady':'Gata pentru checklist-ul tău salvat','home.templateThreeSliding':'Dulap cu trei uși culisante','home.templatesHeading':'🗂️ Șabloanele mele','home.templatesSub':'Biblioteca ta personalizată va trăi aici.','home.unitCabinet':'dulap','home.unitKitchen':'unitate de bucătărie','home.unitLivingRoom':'unitate de living','home.unitOffice':'unitate de birou','home.unitTvWall':'perete TV','home.unitUnderStairs':'unitate sub scară','home.unitWardrobeOrCabinet':'dulap sau șifonier','home.viewAll':'Vezi tot','home.welcomeSubtitle':'Planifică, proiectează și gestionează-ți proiectele cu ușurință.','home.welcomeTitle':'Bine ai venit la AssembleOne Studio 👋','home.whatBuilding':'Ce construiești?',
  'parts.heading':'Verificare panouri','parts.subtitle':'Verifică fiecare panou înainte de a face lista de debitare.',
  'phoneScreen.heading':'Ghid camere','phoneScreen.part':'Piesă','phoneScreen.subtitle':'Panoul selectat este evidențiat.',
  'qrScreen.generate':'Generează coduri QR','qrScreen.heading':'Etichete QR — doar dulapul selectat','qrScreen.print':'Tipărește etichete QR','qrScreen.smartQr':'QR inteligent:','qrScreen.smartQrBody':'Scanează în AssembleOne pentru a deschide exact panoul evidențiat. Când aplicația mobilă are o adresă web publică, lipește-o mai jos și camera normală a telefonului va putea deschide panoul direct.','qrScreen.subtitle':'Codurile QR din alte lucrări și dulapuri sunt păstrate separat.','qrScreen.webAddress':'Adresa web a aplicației mobile','qrScreen.webAddressHint':'Lasă acest câmp gol în timpul testării locale. Apoi scanează cu scanerul din AssembleOne Mobile. Proiectul publicat trebuie să fie deja deschis pe telefon sau iPad.',
  'settingsScreen.appData':'Date aplicație','settingsScreen.appDataHint':'Elimină toate lucrările, desenele și setările salvate pe acest dispozitiv. Aceasta nu poate fi anulată.','settingsScreen.clearData':'Șterge toate datele de pe acest dispozitiv','settingsScreen.cloudSync':'Sincronizare cloud','settingsScreen.cloudSyncHint':'Acest dispozitiv se sincronizează automat cu aplicația de telefon prin cloud. Nu este necesară autentificare.','settingsScreen.heading':'Setări','settingsScreen.language':'Limbă','settingsScreen.languageHint':'Folosește meniul de steaguri din partea de sus a ecranului pentru a schimba limba aplicației.','settingsScreen.subtitle':'Preferințe aplicație și sincronizare.','settingsScreen.unitCm':'Centimetri (cm)','settingsScreen.unitIn':'Inci (in)','settingsScreen.unitMm':'Milimetri (mm)','settingsScreen.units':'Unități de măsură','settingsScreen.unitsHint':'Alege cum sunt afișate și introduse dimensiunile panourilor pe ecranul de desen.',
  sitePlanner:'Planificator de șantier','siteScreen.addFloorPlan':'Adaugă un plan sau o fotografie de șantier. Apoi alege o meserie mai sus și atinge planul.','siteScreen.addMeasurement':'↔ Măsurătoare','siteScreen.addPlan':'Adaugă / schimbă planul de șantier','siteScreen.addWorkStage':'+ Etapă de lucru','siteScreen.chooseTrade':'Alege o meserie, apoi atinge locul exact pe plan','siteScreen.chooseTradeMessage':'Alege o meserie și trimite un mesaj de proiect.','siteScreen.pinHint':'Pinul devine o mică conversație pentru toți cei care lucrează în acel punct.','siteScreen.selectedPin':'Pin selectat','siteScreen.showTrades':'Arată meseriile','siteScreen.subtitle':'Pune lucrări, note și conversații direct pe planul sau fotografia șantierului.','siteScreen.tapPin':'Atinge un pin pe plan.','siteScreen.tapPinHint':'Atinge un pin pentru a citi sau răspunde. Atinge un loc gol după alegerea unei meserii pentru a adăuga un pin nou.','siteScreen.tradeMessages':'Mesaje pe meserii','siteScreen.workOrder':'Ordine de lucru',
  "partname.Adjustable shelf":"Raft reglabil","partname.Appliance panel":"Panou electrocasnic","partname.Back panel":"Panou spate","partname.Base bottom":"Inferior corp bază","partname.Base shelf":"Raft corp bază","partname.Base side":"Lateral corp bază","partname.Base top":"Superior corp bază","partname.Batten":"Riglă de lemn","partname.Bench top":"Blat bancă","partname.Book shelf":"Raft cărți","partname.Bottom":"Inferior","partname.Bottom infill":"Umplutură inferioară","partname.Bracket":"Consolă","partname.Cable panel":"Panou cabluri","partname.Centre divider":"Separator central","partname.Cleat":"Suport de fixare","partname.Clip":"Clip","partname.Cover panel":"Panou de acoperire","partname.Custom panel":"Panou personalizat","partname.Desk side":"Lateral birou","partname.Desk top":"Blat birou","partname.Dishwasher panel":"Panou mașină de spălat vase","partname.Divider":"Separator","partname.Door":"Ușă","partname.Drawer back":"Spate sertar","partname.Drawer bottom":"Fund sertar","partname.Drawer divider":"Separator sertar","partname.Drawer front":"Front sertar","partname.Drawer side":"Lateral sertar","partname.Drawer support":"Suport sertar","partname.Dryer shelf":"Raft uscător","partname.End panel":"Panou terminal","partname.Filler panel":"Panou de umplere","partname.Fireplace panel":"Panou șemineu","partname.Fixed shelf":"Raft fix","partname.Fridge panel":"Panou frigider","partname.Glass shelf":"Raft de sticlă","partname.Handle":"Mâner","partname.Hanging rail":"Bară suspendare","partname.Hob rail":"Șină plită","partname.Infill":"Umplutură","partname.Kickboard":"Plintă bază","partname.LED profile":"Profil LED","partname.Left door":"Ușă stânga","partname.Left infill":"Umplutură stânga","partname.Left-hand side":"Lateral stânga","partname.Light panel":"Panou luminos","partname.Mirror panel":"Panou oglindă","partname.Modesty panel":"Panou de protecție","partname.Oven rail":"Șină cuptor","partname.Pair of doors":"Pereche de uși","partname.Plinth":"Plintă","partname.Pocket door":"Ușă glisantă ascunsă","partname.Printer shelf":"Raft imprimantă","partname.Right door":"Ușă dreapta","partname.Right infill":"Umplutură dreapta","partname.Right-hand side":"Lateral dreapta","partname.Scribe panel":"Panou de ajustare","partname.Seat top":"Blat scaun","partname.Shelf":"Raft","partname.Side":"Lateral","partname.Side panel":"Panou lateral","partname.Sink rail":"Șină chiuvetă","partname.Slatted panel":"Panou cu șipci","partname.Sliding door":"Ușă glisantă","partname.Speaker shelf":"Raft boxe","partname.Splashback":"Panou antistropire","partname.Support":"Suport","partname.TV divider":"Separator TV","partname.TV panel":"Panou TV","partname.TV shelf":"Raft TV","partname.TV side":"Lateral TV","partname.TV top":"Superior TV","partname.Tall cabinet side":"Lateral corp înalt","partname.Toe kick":"Plintă inferioară","partname.Top":"Superior","partname.Top and bottom":"Superior și inferior","partname.Top infill":"Umplutură superioară","partname.Utility shelf":"Raft cameră tehnică","partname.Wall cabinet bottom":"Inferior corp suspendat","partname.Wall cabinet side":"Lateral corp suspendat","partname.Wall cabinet top":"Superior corp suspendat","partname.Wall shelf":"Raft de perete","partname.Washer shelf":"Raft mașină de spălat","partname.Wine shelf":"Raft vinuri","partname.Worktop":"Blat de lucru",
  'msg.noSitePicture':'Nu este disponibilă nicio fotografie de șantier.','msg.sitePhotoBesideDrawing':'Fotografia de șantier este acum lângă instrumentele de desenare, ca referință.','msg.confirmDeleteWardrobe':'Ștergi acest dulap și toate piesele lui?','msg.openProjectFirst':'Deschide mai întâi un proiect.','msg.confirmDeleteRoomUnassigned':'Ștergi camera "{0}"? Dulapurile vor rămâne neatribuite.','msg.jobSaved':'Lucrare salvată.','msg.projectNotFound':'Proiect negăsit.','msg.enterCustomerName':'Introdu numele clientului.','msg.customerAlreadyExists':'"{0}" există deja.','msg.confirmDeleteCustomer':'Ștergi "{0}"?\n\nAceastă acțiune nu poate fi anulată.','msg.confirmDeleteCustomerAndJobs':'Ștergi "{0}" și {1} lucrare/lucrări?\n\nAceastă acțiune nu poate fi anulată.','msg.siteUpdatesImported':'Actualizările de șantier au fost importate. Starea instalării, notele și fotografiile sunt acum din nou în Studio.','msg.notValidSiteUpdateZip':'Acesta nu este un fișier ZIP de actualizare de șantier AssembleOne valid.','msg.confirmDeleteWithoutSaving':'Ștergi "{0}" fără să-l salvezi undeva?\n\nAceastă acțiune nu poate fi anulată.','msg.siteJobNoLongerWaiting':'Această lucrare de șantier nu mai așteaptă.','msg.savedToCustomerJobs':'Salvată în lucrările lui {0} — o găsești oricând din Proiectele mele.','msg.couldNotSaveJobTryDrawing':'Nu s-a putut salva această lucrare. Încearcă Deschide desenul în schimb.','msg.noNewSiteJobsWaiting':'Nu există lucrări de șantier noi în așteptare.','msg.dropZipToReopen':'Plasează un fișier .zip de lucrare AssembleOne pentru a-l redeschide.','msg.siteJobOpenedDrawing':'Lucrare de șantier deschisă în Desen. Fotografia măsurată este gata ca referință.','msg.directSyncNotAvailableBackup':'Sincronizarea directă nu este disponibilă aici. Folosește Deschide fișierul de rezervă.','msg.projectOpenedInStudio':'Proiect deschis în AssembleOne Studio.','msg.notValidProjectZip':'Acesta nu este un fișier ZIP de proiect AssembleOne valid.','msg.choosePictureScreenshotPdf':'Alege o imagine, o captură de ecran sau un fișier PDF.','msg.drawingTooLargeStorage':'Desenul se afișează corect, dar este prea mare pentru stocarea permanentă în browser. Ține această pagină deschisă cât timp lucrezi, sau folosește o captură mai mică.','msg.drawingCouldNotOpen':'Desenul nu a putut fi deschis.','msg.notPictureFileTryDragging':'Acel element nu este un fișier imagine. Încearcă să tragi un PNG sau JPG din folderul Descărcări sau Imagini.','msg.forMarkingPanelsUsePngJpg':'Pentru a marca panourile, folosește o captură PNG sau JPG a PDF-ului.','msg.confirmDeletePanel':'Ștergi {0}?','msg.markOrSelectPanelFirst':'Marchează sau selectează mai întâi un panou.','msg.markPanelFirst':'Marchează mai întâi un panou.','msg.choosePanelFirst':'Alege mai întâi un panou.','msg.allMarkersAlreadyOnDrawing':'Toate cele {0} marcaje sunt deja pe desen.','msg.setQuantityFirst':'Setează mai întâi Cantitatea peste 1, apoi folosește asta pentru a plasa un marcaj pentru fiecare, pe rând.','msg.addedMoreMarkers':'S-au adăugat {0} marcaj(e) în plus, așa că toate cele {1} sunt acum pe desen. Trage fiecare la locul lui real, apoi scanează propriul cod QR odată montat.','msg.selectRepeatedMarkerFirst':'Selectează mai întâi unul dintre marcajele repetate.','msg.noCompletePartsReady':'Nu există piese complete gata. Adaugă mai întâi numele piesei, grosimea, lungimea și lățimea.','msg.confirmRemovePin':'Elimini acest pin?','msg.confirmRemoveLinkedGroupChat':'Elimini această discuție de grup legată?','msg.finishAllSectionsFirst':'Finalizează mai întâi Start, Desen, Panouri, Listă de debitare și Etichete QR. Fiecare casetă va deveni verde când este gata.','msg.dropValidFileTypes':'Plasează aici un fișier PNG, JPG, WEBP sau PDF.','msg.printPreviewCouldNotOpen':'Previzualizarea de tipărire nu s-a putut deschide. Încearcă din nou.','msg.noCompletePanelsToPrint':'Nu există panouri complete gata de tipărit.','msg.generateQrCodesFirst':'Generează mai întâi codurile QR.','msg.openJobFirst':'Deschide mai întâi o lucrare.','msg.nothingSentNoUnit':'Nu s-a trimis nimic deoarece această lucrare nu are încă nicio unitate.','msg.nothingSentNoPanels':'Nu s-a trimis nimic deoarece această lucrare nu are încă panouri.','msg.confirmPanelsNotChecked':'{0} panou(ri) nu au fost încă verificate (lipsesc detalii sau nu au fost revizuite). Trimiți oricum?','msg.cuttingListSent':'Listă de debitare trimisă: {0} panouri și {1} piese.','msg.siteJobSent':'Lucrare de șantier trimisă: {0} cameră, {1} unitate, {2} panouri și {3} piese.','msg.phoneConnectionFailed':'Conexiunea cu telefonul a eșuat. Verifică dacă ambele dispozitive au internet și încearcă din nou.','msg.typeNoteFirst':'Scrie mai întâi o notă.','msg.confirmClearAllData':'Aceasta elimină toate lucrările, desenele și setările salvate pe acest dispozitiv. Această acțiune nu poate fi anulată. Continui?','msg.addPanelBeforeTemplate':'Adaugă cel puțin un panou înainte de a salva un șablon.','msg.pleaseAddMissing':'Te rugăm adaugă: {0}','msg.samePartNumberAdded':'Același număr de piesă a fost adăugat din nou. Trage noul marcaj pe panoul corespunzător.','msg.confirmDeleteJobBase':'Ștergi "{0}"?\n\nAceasta șterge definitiv toate dulapurile, desenele, panourile, listele de debitare, etichetele QR -- ȘI orice fotografii sau măsurători salvate pentru acest lucru.','msg.confirmDeleteJobPhotos':'\n\nAcest lucru are {0} fotografie(i) salvată(e). Acestea vor fi pierdute dacă telefonul nu le mai are și nu le retrimiți.','msg.confirmDeleteJobSibling':'\n\n⚠️ Aceasta pare a fi camera {0} din {1} de la aceeași vizită pe șantier ({2}) -- asigură-te că aceasta este cea pe care chiar vrei să o ștergi, nu o cameră confundată cu un duplicat.','home.tagline':'Camere · Liste de debitare · Panouri QR','status.ready':'Gata','status.installed':'Instalat','status.missing':'Lipsă','status.damaged':'Deteriorat','common.unnamedPart':'Piesă nedenumită','common.notSet':'Nespecificat','common.qty':'Cant.','common.noPanelsMarked':'Niciun panou marcat încă.','common.material':'Material:','common.edging':'Cant:','common.notes':'Note:','common.status':'Stare:','common.choosePartName':'Alege numele piesei','common.testQr':'Testează QR','common.notTestedYet':'Netestat încă','common.noPartsInWardrobe':'Nicio piesă în acest dulap.','common.markerXOfY':'marcaj {0} din {1}','common.doubleClickTickOff':'dublu clic pentru a bifa','common.noCompleteComponentsYet':'Nu există încă componente complete. Completează mai întâi numele și toate măsurătorile.','step.start':'Start','step.drawing':'Desen','step.panels':'Panouri','step.cuttingList':'Listă de debitare','step.qrLabels':'Etichete QR','step.finish':'Finalizare','common.completeFirstFiveStages':'Finalizează primele cinci etape înainte de a trimite proiectul','common.openThisSection':'Deschide această secțiune','common.sendCompletedProjectPhone':'Trimite proiectul finalizat pe telefon sau iPad','common.completeAllFiveStepsFirst':'Finalizează mai întâi toți cei cinci pași anteriori','common.readyToSend':'Gata de trimis','common.completeEveryStepFirst':'Finalizează mai întâi toți pașii','common.completeSuffix':' finalizat','common.notCompleteSuffix':' nefinalizat','common.openStepPrefix':'Deschide ','common.panelCheck':'Verificare panouri','trade.builder':'Constructor','trade.bricklayer':'Zidar','trade.carpenter':'Tâmplar','trade.electrician':'Electrician','trade.plumber':'Instalator','trade.decorator':'Zugrav','trade.flooring':'Pardoseli','trade.wardrobes':'Dulapuri','trade.kitchenInstaller':'Instalator bucătării','trade.tiler':'Faianțar','trade.hvac':'Climatizare','trade.heating':'Încălzire','trade.windows':'Ferestre','trade.doors':'Uși','trade.roofer':'Acoperișar','trade.steelworker':'Fierar','trade.landscaper':'Peisagist','trade.supplier':'Furnizor','trade.client':'Client','trade.other':'Altul','trade.measurement':'Măsurătoare','common.move':'Mutare','common.done':'Gata','common.delete':'Șterge','common.messagePrefix':'Mesaj către ','common.tapPinOnPlan':'Atinge un pin de pe plan.','common.tradeLabel':'Meserie','common.roomAreaLabel':'Cameră / zonă','common.bathroomExample':'Baie','common.statusLabel':'Stare','common.pinStatusNew':'⚪ Nou','common.pinStatusWaiting':'🟡 În așteptare','common.pinStatusDone':'🟢 Gata','common.pinStatusProblem':'🔴 Problemă','common.measurementTypeLabel':'Tip de măsurătoare','common.wallToWall':'Perete la perete','common.measurementMmLabel':'Măsurătoare (mm)','common.mainNoteLabel':'Notă principală','common.whatNeedsDoingPlaceholder':'Ce trebuie făcut aici?','common.photoLabel':'Fotografie','common.savePinBtn':'Salvează pinul','common.deletePinBtn':'Șterge pinul','common.conversationAtPin':'Conversație la acest pin','common.noRepliesYet':'Niciun răspuns încă.','common.writeShortReplyPlaceholder':'Scrie un răspuns scurt…','common.sendBtn':'Trimite','common.dragTradePinToStart':'Trage un pin de meserie peste altul pentru a începe o discuție de grup.','common.reopen':'Redeschide','common.markDone':'Marchează ca finalizat','common.deleteLink':'Șterge legătura','common.noMessagesYet':'Niciun mesaj încă.','common.writeShortMessagePlaceholder':'Scrie un mesaj scurt…','common.stageWaiting':'În așteptare','common.stageStarted':'Început','common.stageDelayed':'Întârziat','common.stageReadyNext':'Gata pentru următoarea meserie','common.stageComplete':'Finalizat','common.addStagesHint':'Adaugă etape doar când ai nevoie de o ordine a lucrărilor.','common.tradeOrStagePrompt':'Meserie sau etapă','common.noCustomersMatchSearch':'Niciun client nu corespunde căutării tale.','common.noCustomersYet':'Niciun client încă. Atinge "+ Client nou" pentru a adăuga unul, sau trimite un Lucru de șantier de pe telefon.','common.jobsCount':'{0} lucrare/lucrări','common.openInMapsLink':'Deschide în Maps ›','common.openPinnedLocationMaps':'📍 Deschide locația fixată în Maps ›','common.dragToTradeDbTitle':'Trage în baza ta de date cu meserii, pe desktop sau într-o altă aplicație pentru a salva o copie a acestui lucru','common.roomFallback':'Cameră','common.openArrowBtn':'Deschide ›','common.noJobsYetCustomer':'Niciun lucru încă pentru acest client.','common.siblingRoomTag':'🔗 Camera {0} din {1} de la aceeași vizită pe șantier — nu este un duplicat','common.customerNotNamed':'Client fără nume','common.newSiteJob':'Lucru nou de șantier','common.roomNotNamed':'Cameră fără nume','common.newBadge':'NOU','common.noNewJobsBadge':'Niciun lucru nou','common.noNewSiteJobsList':'Niciun lucru nou de șantier','common.jobCouldNotBeRead':'⚠ Lucrul nu a putut fi citit','common.jobDataCorrupted':'Datele acestui lucru sunt corupte. Elimină-l pentru a nu bloca lucrările noi.','common.remove':'Elimină','common.removeWithoutOpening':'Elimină fără a deschide','common.saveToCustomer':'📁 Salvează la client','common.openDrawingArrow':'Deschide desenul ›','common.useBackupFile':'Folosește fișierul de rezervă','common.directSyncUnavailableUseBackup':'Sincronizarea directă nu este disponibilă. Folosește fișierul de rezervă.','common.couldNotAddDrawing':'Desenul nu a putut fi adăugat','common.roomsArea':'Zona camerelor','common.selectedFileCouldNotBeRead':'Fișierul selectat nu a putut fi citit.','common.openingFileCancelled':'Deschiderea fișierului a fost anulată.','common.openingFileEllipsis':'Se deschide ','common.photoOrScreenshotFallback':'fotografie sau captură de ecran','common.fileWasEmpty':'Fișierul era gol.','common.tryAnotherPictureScreenshot':'Te rugăm încearcă altă imagine sau captură de ecran.','common.checkingClipboardForDrawing':'Se verifică clipboard-ul pentru un desen…','common.drawingPastedFromClipboard':'Desen lipit din clipboard.','common.copyDrawingThenPasteHint':'Copiază desenul, apoi apasă Ctrl + V. Caseta de desen este pregătită.','common.installerNotesHeading':'Note pentru montator','common.accessOrderPlaceholder':'Acces, ordinea lucrărilor, prize, plinte sau alte instrucțiuni','common.inThisRoomHeading':'În această cameră','common.panelsTapToRemove':'panouri · atinge pentru a elimina','common.noWardrobeCabinetYet':'Niciun dulap aici încă.','common.addWardrobeCabinetHeading':'Adaugă un dulap','common.panelsWord':'panouri','common.noUnassignedUnits':'Nicio unitate neatribuită. Adaugă mai întâi un dulap sau deschide altă cameră.','common.renameRoomBtn':'Redenumește camera','common.deleteRoomBtn':'Șterge camera','common.roomNamePrompt':'Numele camerei:','common.wardrobeOrCabinetCount':'{0} dulap/dulapuri','common.placeUnitsBtn':'Plasează {0} unitate/unități','common.tapRoomAddUnit':'Atinge o cameră, apoi adaugă unitatea','common.noRoomSelectedYet':'Nicio cameră selectată încă. Apasă Alege camera și atinge o imagine.','roomType.kitchen':'Bucătărie','roomType.livingRoom':'Living','roomType.tvWall':'Perete TV','roomType.masterBedroom':'Dormitor principal','roomType.bedroom':'Dormitor','roomType.kidsBedroom':'Camera copiilor','roomType.dressingRoom':'Dressing','roomType.bathroom':'Baie','roomType.office':'Birou','roomType.laundry':'Spălătorie','roomType.utilityRoom':'Cameră tehnică','roomType.hallway':'Hol','roomType.underStairs':'Sub scară','roomType.wineRoom':'Cameră vinuri','roomType.library':'Bibliotecă','roomType.custom':'Personalizat','common.chooseRoomHeading':'Alege camera','common.tapPictureRoomHelp':'Atinge imaginea camerei la care lucrezi. Poți adăuga același tip de cameră de mai multe ori.','common.typeRoomNamePlaceholder':'Scrie numele camerei','common.addRoomBtn':'Adaugă cameră','common.editJobHeading':'Editează lucrarea','common.jobNameLabel':'Numele lucrării','common.customerLabel':'Client','common.cancelBtn':'Anulează','common.saveBtn':'Salvează','common.createOrOpenJobNote':'Creează o lucrare nouă sau deschide una salvată.','common.untitledJob':'Lucrare fără titlu','common.addCustomer':'Adaugă client','common.editBtn':'Editează','common.chooseRoomBtn':'Alege camera','common.continueToDrawing':'➡ Continuă la desen','common.openDrawingBtn':'Deschide desenul','common.roomsWord':'camere','common.unitsWord':'unități','common.materialsWord':'materiale','common.piecesWord':'piese','common.oneUnit':'1 unitate','common.unitsCount':'{0} unități','common.piecesCount':'{0} piese','common.selectedRoomPrefix':'Camera selectată · ','common.noCustomerName':'Fără nume de client','common.everythingReady':'Totul este gata','common.checkRedCardsBeforeSending':'Verifică cardurile roșii înainte de a trimite','common.qrPanelsTitle':'Panouri QR','common.projectNotesTitle':'Note despre proiect','common.roomsHeading':'Camere','common.noRoomsYet':'Nicio cameră încă.','common.panelsNeedMoreInfo':'⚠ {0} panou(ri) au nevoie de mai multe informații înainte de lista de debitare.','common.noPanelsYetReturnDrawing':'Niciun panou încă. Revino la Desen și marchează primul panou.','common.panelsReadyCount':'{0} din {1} panouri gata','common.longShortEdges':'{0} muchie/muchii lungă/lungi · {1} muchie/muchii scurtă/scurte','common.measurementsLabel':'Măsurători:','common.panelCheckedLabel':'Panou verificat','common.panelNotCheckedLabel':'Panou neverificat','common.doubleClickApprovePanel':'Dublu clic pentru a aproba acest panou','common.doubleClickAfterChecking':'Dublu clic după ce verifici acest panou','common.buildChecklistHeading':'Listă de construcție','common.hardwareChecklistHeading':'Listă feronerie','common.tickedOffCount':'{0} din {1} bifate','common.autoPickedUpHint':'Fiecare panou pe care îl denumești pe desen apare aici automat — nu este nevoie să îl scrii.','common.addOwnElectricalPlaceholder':'Adaugă-l pe al tău, de ex. Panou de acces electric','common.addOwnSoftClosePlaceholder':'Adaugă-l pe al tău, de ex. Amortizoare soft-close','common.addBtnPlus':'+ Adaugă','common.useSavedTemplateHeading':'Folosești un șablon salvat?','common.startFromPreviousHint':'Începe acest dulap dintr-o listă de panouri anterioară sau începe de la zero.','common.panelsHardwareCount':'{0} panou(ri) · {1} feronerie/feronerii','common.startBlankBtn':'Începe de la zero','common.saveAsTemplateHeading':'Salvează ca șablon','common.templateNameLabel':'Numele șablonului','common.templateNamePlaceholder':'de ex. Dulap cu două uși','common.saveTemplateBtn':'Salvează șablonul','common.edgingConfirmationNeeded':'Cantul și toate detaliile necesită confirmare','common.editPanelBtn':'Editează panoul','hardware.hinges':'Balamale','hardware.handles':'Mânere','hardware.shelfPins':'Suporți raft','hardware.ledLights':'Lumini LED','hardware.ledDriverTransformer':'Driver/transformator LED','hardware.screwsFixings':'Șuruburi și fixări','common.addedOnDrawing':'Adăugat pe desen','common.panelSavedToast':'Panou salvat','common.panelSavedNextReady':'Panou salvat · Următorul panou pregătit','common.panelCouldNotBeSaved':'Panoul nu a putut fi salvat','common.addMainInfoHint':'Adaugă informațiile principale pe care montatorul trebuie să le rețină.','common.accessOrderSpecialPlaceholder':'Acces, ordinea lucrărilor, instrucțiuni speciale, iluminat sau orice altceva important','common.saveNotesBtn':'✓ Salvează notele','common.noWardrobeSelected':'Niciun dulap selectat.','common.noCompletePartsReadySupplier':'Nicio piesă completă nu este gata pentru furnizor. Adaugă mai întâi numele, grosimea, lungimea și lățimea.','common.partTypeCount':'{0} tip(uri) de piesă','common.partNoHeader':'Nr. piesă','common.panelDetailsHeader':'Detalii panou','common.descWhereGoesHeader':'Descriere / unde merge','common.noProjectSelected':'Niciun proiect selectat.','common.noImageDrawingAvailable':'Niciun desen imagine disponibil.','common.partHeader':'Piesă','common.descriptionHeader':'Descriere','common.statusHeaderPlain':'Stare','common.panelNotFound':'Panou negăsit','common.drawingMissingFor':'Lipsește desenul pentru {0}','common.openedOnDrawing':'{0} deschis pe desenul evidențiat','common.allowPopupsPrintQr':'Permite ferestre pop-up pentru a tipări etichetele QR','common.qrCodesGenerated':'Coduri QR generate','nav.home':'Acasă','nav.customers':'Clienți','nav.qrAndScan':'QR și scanare','nav.finishJob':'Finalizează lucrarea','nav.settings':'Setări','drawing.saveToCustomer':'Salvează la client','jobs.newJobCustomerPrompt':'Numele clientului pentru această lucrare?','drawing.enterCustomerNamePrompt':'Pentru ce client este această lucrare?','common.savedToCustomerToast':'Salvat la {0}'
 },
 it:{start:'Avvia progetto',startHelp:'Inserisci il lavoro e scegli cosa stai costruendo. Le stanze restano nel progetto e vengono inviate al telefono.',job:'A cosa stai lavorando?',summary:'Completa il lavoro',summaryHelp:'Un ultimo controllo visivo, poi salva o invia una nota al team di installazione.',finish:'Invia a telefono o iPad',noteLabel:'Nota per il telefono',noteHint:'Viene inviata da sola, separata dalla lista di taglio — utile per un messaggio rapido su questo lavoro, in qualsiasi fase.',notePlaceholder:"Esempio: Armadio di Red — il cliente vuole cerniere soft-close, confermare prima del montaggio.",noteSendBtn:'Invia nota al telefono',noteSendSmall:'Solo questa nota, nessuna lista di taglio necessaria',
  'bom.pcsShort':'pz','bomScreen.deleteJob':'Elimina questo lavoro','bomScreen.saveProject':'Salva progetto','bomScreen.saveProjectSub':'Mantieni tutte le modifiche di Studio','bomScreen.templateCheck':'Controllo modello e ferramenta','bomScreen.templateCheckSub':'Ricontrolla pannelli, cerniere, luci, guide, cassetti e ferramenta prima di inviare.',
  'customers.addCustomer':'💾 Aggiungi cliente','customers.address':'Indirizzo','customers.backToCustomers':'← Clienti','customers.cancel':'Annulla','customers.delete':'🗑 Elimina','customers.edit':'✏️ Modifica','customers.heading':'Clienti','customers.name':'Nome','customers.newCustomer':'+ Nuovo cliente','customers.phone':'Telefono','customers.save':'💾 Salva','customers.searchPlaceholder':'Cerca clienti...','customers.subtitle':'Ogni lavoro, salvato e organizzato per cliente.',
  'drawing.back':'Indietro','drawing.catDoors':'Porte e cassetti','drawing.catInfills':'Riempimenti','drawing.catKitchen':'Mobili da cucina','drawing.catTv':'Pareti e mobili TV','drawing.catUtility':'Utilità e pezzi speciali','drawing.catWardrobes':'Armadi e mobili','drawing.checkAllPanels':'✓ Controlla tutti i pannelli','drawing.chooseDrawing':'Scegli disegno','drawing.chosenParts':'Pezzi scelti','drawing.delete':'Elimina','drawing.dropHere':'Rilascia un disegno, screenshot o foto qui','drawing.dropHereHint':'Usa i pulsanti sopra, trascina un disegno in questo riquadro, o premi Ctrl + V dopo aver copiato uno screenshot.','drawing.dropHereSub':'Incolla, rilascia, scegli un file o scatta una foto.','drawing.edgeBandingTitle':'Doppio clic per aggiungere la bordatura','drawing.edgeHelp':'Fai doppio clic sul numero di lunghezza o larghezza per aggiungere la bordatura: nessuna linea → una linea → doppia linea.','drawing.fit':'Adatta','drawing.fitDrawing':'Adatta disegno','drawing.leftRight':'Sinistra / Destra','drawing.length':'Lunghezza','drawing.makeUnique':'Rendi unico il marcatore selezionato','drawing.materialChooseOnce':'Materiale — scegli una volta per questo lavoro','drawing.materialHint':'Digita il nome esatto del materiale usato per questo lavoro.','drawing.materialPrefix':'Materiale','drawing.morePartNames':'Altri nomi di pezzi','drawing.noDrawing':'Nessun disegno','drawing.noPanelSelected':'Nessun pannello selezionato','drawing.notesHint':'Aggiungi o usa un\'altra nota','drawing.notesOptional':'Note — opzionale','drawing.notesPrefix':'Note','drawing.panelOptions':'Opzioni pannello','drawing.partName':'Nome pezzo','drawing.partNamePlaceholder':'Scegli o digita un nome di pezzo…','drawing.partSelected':'Pezzo selezionato','drawing.pasteDrawing':'Incolla disegno','drawing.pasteTitle':'Incolla uno screenshot o un\'immagine copiata','drawing.putSameNumber':'+ Metti lo stesso numero sul disegno','drawing.quantity':'Quantità','drawing.samePanelMarkers':'Stessi marcatori di pannello:','drawing.saveMaterial':'Salva materiale','drawing.saveNext':'Salva e avanti','drawing.thickness':'Spessore','drawing.topBottom':'Sopra / Sotto','drawing.width':'Larghezza','drawing.zoomIn':'Aumenta zoom','drawing.zoomOut':'Riduci zoom',
  'home.addLabel':'Aggiungi','home.addUnitBelow':'Aggiungi l\'unità corretta qui sotto.','home.addWardrobe':'+ Aggiungi armadio o mobile','home.back':'← Indietro','home.back2':'Indietro','home.backHome':'← Home','home.chooseRoomHeading':'Scegli stanza','home.chooseRoomHint':'Tocca un grande pulsante immagine. La stanza rimane in questo progetto e viene inviata automaticamente al telefono.','home.chooseRoomHint2':'Scegli una stanza sopra, poi aggiungi il mobile corretto per quella stanza.','home.continueJob':'Continua lavoro attuale','home.currentJobFallback':'Lavoro attuale','home.customerLabel':'Cliente','home.customerPlaceholder':'Nome cliente','home.customersJobs':'Clienti e lavori','home.customersJobsSub':'Vedi tutti i clienti e i loro progetti','home.jobNameHint':'Assegna un nome al lavoro una volta, poi scegli la stanza in cui stai lavorando.','home.jobNameLabel':'Nome lavoro','home.jobNamePlaceholder':'es. Casa di Simone','home.newProject':'Nuovo progetto','home.newProjectSub':'Avvia un nuovo cliente o progetto','home.openJobHint':'Apri il lavoro su cui stai lavorando','home.recentJobs':'Lavori recenti','home.recentJobsSub':'I tuoi lavori aperti di recente','home.saveTemplateLater':'＋ Salva un nuovo modello più tardi','home.selectedRoomPrefix':'Stanza selezionata:','home.siteJobs':'Lavori in cantiere','home.siteJobsNew':'Nuovi lavori inviati dal tuo telefono','home.siteJobsSub':'Foto e misure dal tuo telefono','home.templateFourDoor':'Armadio a quattro ante','home.templateReady':'Pronto per la tua checklist salvata','home.templateThreeSliding':'Armadio a tre ante scorrevoli','home.templatesHeading':'🗂️ I miei modelli','home.templatesSub':'La tua libreria personalizzata vivrà qui.','home.unitCabinet':'mobile','home.unitKitchen':'mobile da cucina','home.unitLivingRoom':'mobile da soggiorno','home.unitOffice':'mobile da ufficio','home.unitTvWall':'parete TV','home.unitUnderStairs':'mobile sottoscala','home.unitWardrobeOrCabinet':'armadio o mobile','home.viewAll':'Vedi tutto','home.welcomeSubtitle':'Pianifica, progetta e gestisci i tuoi progetti con facilità.','home.welcomeTitle':'Benvenuto in AssembleOne Studio 👋','home.whatBuilding':'Cosa stai costruendo?',
  'parts.heading':'Controllo pannelli','parts.subtitle':'Controlla ogni pannello prima di creare la lista di taglio.',
  'phoneScreen.heading':'Guida stanze','phoneScreen.part':'Pezzo','phoneScreen.subtitle':'Il pannello selezionato è evidenziato.',
  'qrScreen.generate':'Genera codici QR','qrScreen.heading':'Etichette QR — solo armadio selezionato','qrScreen.print':'Stampa etichette QR','qrScreen.smartQr':'QR intelligente:','qrScreen.smartQrBody':'Scansiona dentro AssembleOne per aprire esattamente il pannello evidenziato. Quando l\'app mobile ha un indirizzo web pubblico, incollalo qui sotto e anche la normale fotocamera del telefono potrà aprire il pannello direttamente.','qrScreen.subtitle':'I codici QR di altri lavori e armadi vengono tenuti separati.','qrScreen.webAddress':'Indirizzo web dell\'app mobile','qrScreen.webAddressHint':'Lascia questo vuoto durante i test locali. Poi scansiona con lo scanner dentro AssembleOne Mobile. Il progetto pubblicato deve essere già aperto sul telefono o iPad.',
  'settingsScreen.appData':'Dati app','settingsScreen.appDataHint':'Rimuovi tutti i lavori, disegni e impostazioni salvati su questo dispositivo. Questo non può essere annullato.','settingsScreen.clearData':'Cancella tutti i dati su questo dispositivo','settingsScreen.cloudSync':'Sincronizzazione cloud','settingsScreen.cloudSyncHint':'Questo dispositivo si sincronizza automaticamente con l\'app del telefono tramite il cloud. Non è richiesto l\'accesso.','settingsScreen.heading':'Impostazioni','settingsScreen.language':'Lingua','settingsScreen.languageHint':'Usa il menu delle bandiere in alto nello schermo per cambiare la lingua dell\'app.','settingsScreen.subtitle':'Preferenze app e sincronizzazione.','settingsScreen.unitCm':'Centimetri (cm)','settingsScreen.unitIn':'Pollici (in)','settingsScreen.unitMm':'Millimetri (mm)','settingsScreen.units':'Unità di misura','settingsScreen.unitsHint':'Scegli come vengono mostrate e digitate le dimensioni dei pannelli nella schermata di disegno.',
  sitePlanner:'Pianificatore di cantiere','siteScreen.addFloorPlan':'Aggiungi una planimetria o una foto del cantiere. Poi scegli un mestiere sopra e tocca la planimetria.','siteScreen.addMeasurement':'↔ Misura','siteScreen.addPlan':'Aggiungi / cambia planimetria cantiere','siteScreen.addWorkStage':'+ Fase di lavoro','siteScreen.chooseTrade':'Scegli un mestiere, poi tocca il punto esatto sulla planimetria','siteScreen.chooseTradeMessage':'Scegli un mestiere e invia un messaggio di progetto.','siteScreen.pinHint':'Il pin diventa una piccola conversazione per tutti quelli che lavorano in quel punto.','siteScreen.selectedPin':'Pin selezionato','siteScreen.showTrades':'Mostra mestieri','siteScreen.subtitle':'Metti lavoro, note e conversazioni direttamente sulla planimetria o foto del cantiere.','siteScreen.tapPin':'Tocca un pin sulla planimetria.','siteScreen.tapPinHint':'Tocca un pin per leggere o rispondere. Tocca un punto vuoto dopo aver scelto un mestiere per aggiungere un nuovo pin.','siteScreen.tradeMessages':'Messaggi per mestiere','siteScreen.workOrder':'Ordine di lavoro',
  "partname.Adjustable shelf":"Ripiano regolabile","partname.Appliance panel":"Pannello elettrodomestico","partname.Back panel":"Pannello posteriore","partname.Base bottom":"Inferiore base","partname.Base shelf":"Ripiano base","partname.Base side":"Fianco base","partname.Base top":"Superiore base","partname.Batten":"Listello di legno","partname.Bench top":"Piano panca","partname.Book shelf":"Libreria","partname.Bottom":"Inferiore","partname.Bottom infill":"Riempimento inferiore","partname.Bracket":"Staffa","partname.Cable panel":"Pannello cavi","partname.Centre divider":"Divisore centrale","partname.Cleat":"Listello","partname.Clip":"Clip","partname.Cover panel":"Pannello di copertura","partname.Custom panel":"Pannello personalizzato","partname.Desk side":"Fianco scrivania","partname.Desk top":"Piano scrivania","partname.Dishwasher panel":"Pannello lavastoviglie","partname.Divider":"Divisore","partname.Door":"Anta","partname.Drawer back":"Retro cassetto","partname.Drawer bottom":"Fondo cassetto","partname.Drawer divider":"Divisore cassetto","partname.Drawer front":"Fronte cassetto","partname.Drawer side":"Fianco cassetto","partname.Drawer support":"Supporto cassetto","partname.Dryer shelf":"Mensola asciugatrice","partname.End panel":"Pannello terminale","partname.Filler panel":"Pannello di riempimento","partname.Fireplace panel":"Pannello camino","partname.Fixed shelf":"Ripiano fisso","partname.Fridge panel":"Pannello frigorifero","partname.Glass shelf":"Ripiano in vetro","partname.Handle":"Maniglia","partname.Hanging rail":"Bastone appendiabiti","partname.Hob rail":"Guida piano cottura","partname.Infill":"Riempimento","partname.Kickboard":"Zoccolo battiscopa","partname.LED profile":"Profilo LED","partname.Left door":"Anta sinistra","partname.Left infill":"Riempimento sinistro","partname.Left-hand side":"Fianco sinistro","partname.Light panel":"Pannello luminoso","partname.Mirror panel":"Pannello specchio","partname.Modesty panel":"Pannello di protezione","partname.Oven rail":"Guida forno","partname.Pair of doors":"Coppia di ante","partname.Plinth":"Zoccolo","partname.Pocket door":"Porta scorrevole a scomparsa","partname.Printer shelf":"Mensola stampante","partname.Right door":"Anta destra","partname.Right infill":"Riempimento destro","partname.Right-hand side":"Fianco destro","partname.Scribe panel":"Pannello di raccordo","partname.Seat top":"Piano sedile","partname.Shelf":"Ripiano","partname.Side":"Fianco","partname.Side panel":"Pannello laterale","partname.Sink rail":"Guida lavello","partname.Slatted panel":"Pannello doghe","partname.Sliding door":"Porta scorrevole","partname.Speaker shelf":"Mensola diffusore","partname.Splashback":"Paraschizzi","partname.Support":"Supporto","partname.TV divider":"Divisore TV","partname.TV panel":"Pannello TV","partname.TV shelf":"Mensola TV","partname.TV side":"Fianco TV","partname.TV top":"Superiore TV","partname.Tall cabinet side":"Fianco colonna","partname.Toe kick":"Zoccolo inferiore","partname.Top":"Superiore","partname.Top and bottom":"Superiore e inferiore","partname.Top infill":"Riempimento superiore","partname.Utility shelf":"Mensola lavanderia","partname.Wall cabinet bottom":"Inferiore pensile","partname.Wall cabinet side":"Fianco pensile","partname.Wall cabinet top":"Superiore pensile","partname.Wall shelf":"Mensola a parete","partname.Washer shelf":"Mensola lavatrice","partname.Wine shelf":"Mensola vini","partname.Worktop":"Piano di lavoro",
  'msg.noSitePicture':'Nessuna foto del cantiere disponibile.','msg.sitePhotoBesideDrawing':"La foto del cantiere è ora accanto agli strumenti di disegno, come riferimento.",'msg.confirmDeleteWardrobe':'Eliminare questo armadio e tutti i suoi pezzi?','msg.openProjectFirst':'Apri prima un progetto.','msg.confirmDeleteRoomUnassigned':'Eliminare la stanza "{0}"? Gli armadi rimarranno non assegnati.','msg.jobSaved':'Lavoro salvato.','msg.projectNotFound':'Progetto non trovato.','msg.enterCustomerName':'Inserisci il nome del cliente.','msg.customerAlreadyExists':'"{0}" esiste già.','msg.confirmDeleteCustomer':'Eliminare "{0}"?\n\nQuesta azione non può essere annullata.','msg.confirmDeleteCustomerAndJobs':'Eliminare "{0}" e {1} lavoro/i?\n\nQuesta azione non può essere annullata.','msg.siteUpdatesImported':"Gli aggiornamenti del cantiere sono stati importati. Lo stato dell'installazione, le note e le foto sono ora di nuovo in Studio.",'msg.notValidSiteUpdateZip':'Questo non è un file ZIP di aggiornamento cantiere AssembleOne valido.','msg.confirmDeleteWithoutSaving':'Eliminare "{0}" senza salvarlo da nessuna parte?\n\nQuesta azione non può essere annullata.','msg.siteJobNoLongerWaiting':'Questo lavoro in cantiere non è più in attesa.','msg.savedToCustomerJobs':'Salvato nei lavori di {0} — lo trovi sempre da I miei progetti.','msg.couldNotSaveJobTryDrawing':'Impossibile salvare questo lavoro. Prova invece Apri disegno.','msg.noNewSiteJobsWaiting':'Nessun nuovo lavoro in cantiere in attesa.','msg.dropZipToReopen':'Trascina un file .zip di lavoro AssembleOne per riaprirlo.','msg.siteJobOpenedDrawing':'Lavoro in cantiere aperto in Disegno. La foto delle misure è pronta come riferimento.','msg.directSyncNotAvailableBackup':'La sincronizzazione diretta non è disponibile qui. Usa Apri file di backup.','msg.projectOpenedInStudio':'Progetto aperto in AssembleOne Studio.','msg.notValidProjectZip':'Questo non è un file ZIP di progetto AssembleOne valido.','msg.choosePictureScreenshotPdf':"Scegli un'immagine, uno screenshot o un file PDF.",'msg.drawingTooLargeStorage':'Il disegno viene visualizzato correttamente, ma è troppo grande per l\'archiviazione permanente nel browser. Tieni questa pagina aperta mentre lavori, oppure usa uno screenshot più piccolo.','msg.drawingCouldNotOpen':'Impossibile aprire il disegno.','msg.notPictureFileTryDragging':"Quell'elemento non è un file immagine. Prova a trascinare un PNG o JPG dalla cartella Download o Immagini.",'msg.forMarkingPanelsUsePngJpg':'Per contrassegnare i pannelli, usa uno screenshot PNG o JPG del PDF.','msg.confirmDeletePanel':'Eliminare {0}?','msg.markOrSelectPanelFirst':'Contrassegna o seleziona prima un pannello.','msg.markPanelFirst':'Contrassegna prima un pannello.','msg.choosePanelFirst':'Scegli prima un pannello.','msg.allMarkersAlreadyOnDrawing':'Tutti i {0} contrassegni sono già sul disegno.','msg.setQuantityFirst':'Imposta prima Quantità sopra 1, poi usa questo per posizionare un contrassegno per ciascuno, uno alla volta.','msg.addedMoreMarkers':'Aggiunti {0} contrassegni in più, quindi tutti i {1} sono ora sul disegno. Trascina ciascuno nella sua posizione reale, poi scansiona il proprio codice QR una volta installato.','msg.selectRepeatedMarkerFirst':'Seleziona prima uno dei contrassegni ripetuti.','msg.noCompletePartsReady':'Nessun pezzo completo pronto. Aggiungi prima nome del pezzo, spessore, lunghezza e larghezza.','msg.confirmRemovePin':'Rimuovere questo pin?','msg.confirmRemoveLinkedGroupChat':'Rimuovere questa chat di gruppo collegata?','msg.finishAllSectionsFirst':'Completa prima Inizio, Disegno, Pannelli, Lista di taglio ed Etichette QR. Ogni riquadro diventerà verde quando sarà pronto.','msg.dropValidFileTypes':'Trascina qui un file PNG, JPG, WEBP o PDF.','msg.printPreviewCouldNotOpen':'Impossibile aprire l\'anteprima di stampa. Riprova.','msg.noCompletePanelsToPrint':'Nessun pannello completo pronto per la stampa.','msg.generateQrCodesFirst':'Genera prima i codici QR.','msg.openJobFirst':'Apri prima un lavoro.','msg.nothingSentNoUnit':'Non è stato inviato nulla perché questo lavoro non ha ancora nessuna unità.','msg.nothingSentNoPanels':'Non è stato inviato nulla perché questo lavoro non ha ancora pannelli.','msg.confirmPanelsNotChecked':'{0} pannello/i non sono ancora stati controllati (mancano dettagli o non sono stati rivisti). Inviare comunque?','msg.cuttingListSent':'Lista di taglio inviata: {0} pannelli e {1} pezzi.','msg.siteJobSent':'Lavoro in cantiere inviato: {0} stanza, {1} unità, {2} pannelli e {3} pezzi.','msg.phoneConnectionFailed':'Connessione al telefono non riuscita. Verifica che entrambi i dispositivi abbiano internet e riprova.','msg.typeNoteFirst':'Scrivi prima una nota.','msg.confirmClearAllData':'Questo rimuoverà tutti i lavori, i disegni e le impostazioni salvati su questo dispositivo. Questa azione non può essere annullata. Continuare?','msg.addPanelBeforeTemplate':'Aggiungi almeno un pannello prima di salvare un modello.','msg.pleaseAddMissing':'Aggiungi: {0}','msg.samePartNumberAdded':'Lo stesso numero di pezzo è stato aggiunto di nuovo. Trascina il nuovo contrassegno sul pannello corrispondente.','msg.confirmDeleteJobBase':'Eliminare "{0}"?\n\nQuesto eliminerà permanentemente tutti gli armadi, i disegni, i pannelli, le liste di taglio, le etichette QR -- E qualsiasi foto o misura salvata per questo lavoro.','msg.confirmDeleteJobPhotos':'\n\nQuesto lavoro ha {0} foto salvate. Andranno perse a meno che il telefono non le abbia ancora e tu le reinvii.','msg.confirmDeleteJobSibling':'\n\n⚠️ Questa sembra essere la stanza {0} di {1} dalla stessa visita al cantiere ({2}) -- assicurati che sia davvero quella che vuoi eliminare, e non una stanza scambiata per un duplicato.','home.tagline':'Stanze · Liste di taglio · Pannelli QR','status.ready':'Pronto','status.installed':'Installato','status.missing':'Mancante','status.damaged':'Danneggiato','common.unnamedPart':'Pezzo senza nome','common.notSet':'Non impostato','common.qty':'Qtà','common.noPanelsMarked':'Nessun pannello ancora contrassegnato.','common.material':'Materiale:','common.edging':'Bordatura:','common.notes':'Note:','common.status':'Stato:','common.choosePartName':'Scegli il nome del pezzo','common.testQr':'Testa QR','common.notTestedYet':'Non ancora testato','common.noPartsInWardrobe':'Nessun pezzo in questo armadio.','common.markerXOfY':'contrassegno {0} di {1}','common.doubleClickTickOff':'doppio clic per spuntare','common.noCompleteComponentsYet':'Nessun componente completo ancora. Completa prima il nome e tutte le misure.','step.start':'Inizio','step.drawing':'Disegno','step.panels':'Pannelli','step.cuttingList':'Lista di taglio','step.qrLabels':'Etichette QR','step.finish':'Fine','common.completeFirstFiveStages':'Completa le prime cinque fasi prima di inviare il progetto','common.openThisSection':'Apri questa sezione','common.sendCompletedProjectPhone':'Invia il progetto completato al telefono o iPad','common.completeAllFiveStepsFirst':'Completa prima tutti e cinque i passaggi precedenti','common.readyToSend':"Pronto per l'invio",'common.completeEveryStepFirst':'Completa prima tutti i passaggi','common.completeSuffix':' completato','common.notCompleteSuffix':' non completato','common.openStepPrefix':'Apri ','common.panelCheck':'Controllo pannelli','trade.builder':'Costruttore','trade.bricklayer':'Muratore','trade.carpenter':'Falegname','trade.electrician':'Elettricista','trade.plumber':'Idraulico','trade.decorator':'Imbianchino','trade.flooring':'Pavimenti','trade.wardrobes':'Armadi','trade.kitchenInstaller':'Installatore cucine','trade.tiler':'Piastrellista','trade.hvac':'Climatizzazione','trade.heating':'Riscaldamento','trade.windows':'Finestre','trade.doors':'Porte','trade.roofer':'Copritetti','trade.steelworker':'Carpentiere metallico','trade.landscaper':'Giardiniere','trade.supplier':'Fornitore','trade.client':'Cliente','trade.other':'Altro','trade.measurement':'Misurazione','common.move':'Sposta','common.done':'Fatto','common.delete':'Elimina','common.messagePrefix':'Messaggio a ','common.tapPinOnPlan':'Tocca un pin sulla planimetria.','common.tradeLabel':'Mestiere','common.roomAreaLabel':'Stanza / zona','common.bathroomExample':'Bagno','common.statusLabel':'Stato','common.pinStatusNew':'⚪ Nuovo','common.pinStatusWaiting':'🟡 In attesa','common.pinStatusDone':'🟢 Fatto','common.pinStatusProblem':'🔴 Problema','common.measurementTypeLabel':'Tipo di misura','common.wallToWall':'Da parete a parete','common.measurementMmLabel':'Misura (mm)','common.mainNoteLabel':'Nota principale','common.whatNeedsDoingPlaceholder':'Cosa bisogna fare qui?','common.photoLabel':'Foto','common.savePinBtn':'Salva pin','common.deletePinBtn':'Elimina pin','common.conversationAtPin':'Conversazione su questo pin','common.noRepliesYet':'Nessuna risposta ancora.','common.writeShortReplyPlaceholder':'Scrivi una breve risposta…','common.sendBtn':'Invia','common.dragTradePinToStart':'Trascina un pin di un mestiere su un altro per avviare una chat di gruppo.','common.reopen':'Riapri','common.markDone':'Segna come fatto','common.deleteLink':'Elimina collegamento','common.noMessagesYet':'Nessun messaggio ancora.','common.writeShortMessagePlaceholder':'Scrivi un breve messaggio…','common.stageWaiting':'In attesa','common.stageStarted':'Iniziato','common.stageDelayed':'Ritardato','common.stageReadyNext':'Pronto per il prossimo mestiere','common.stageComplete':'Completato','common.addStagesHint':'Aggiungi fasi solo quando hai bisogno di un ordine di lavoro.','common.tradeOrStagePrompt':'Mestiere o fase','common.noCustomersMatchSearch':'Nessun cliente corrisponde alla tua ricerca.','common.noCustomersYet':'Nessun cliente ancora. Tocca "+ Nuovo cliente" per aggiungerne uno, oppure invia un Lavoro di cantiere dal tuo telefono.','common.jobsCount':'{0} lavoro/i','common.openInMapsLink':'Apri in Maps ›','common.openPinnedLocationMaps':'📍 Apri la posizione fissata in Maps ›','common.dragToTradeDbTitle':"Trascina nel tuo database dei mestieri, sul desktop o in un'altra app per salvare una copia di questo lavoro",'common.roomFallback':'Stanza','common.openArrowBtn':'Apri ›','common.noJobsYetCustomer':'Nessun lavoro ancora per questo cliente.','common.siblingRoomTag':'🔗 Stanza {0} di {1} dalla stessa visita al cantiere — non è un duplicato','common.customerNotNamed':'Cliente senza nome','common.newSiteJob':'Nuovo lavoro di cantiere','common.roomNotNamed':'Stanza senza nome','common.newBadge':'NUOVO','common.noNewJobsBadge':'Nessun lavoro nuovo','common.noNewSiteJobsList':'Nessun nuovo lavoro di cantiere','common.jobCouldNotBeRead':'⚠ Impossibile leggere il lavoro','common.jobDataCorrupted':'I dati di questo lavoro sono danneggiati. Rimuovilo per non bloccare i nuovi lavori.','common.remove':'Rimuovi','common.removeWithoutOpening':'Rimuovi senza aprire','common.saveToCustomer':'📁 Salva nel cliente','common.openDrawingArrow':'Apri disegno ›','common.useBackupFile':'Usa il file di backup','common.directSyncUnavailableUseBackup':'Sincronizzazione diretta non disponibile. Usa il file di backup.','common.couldNotAddDrawing':'Impossibile aggiungere il disegno','common.roomsArea':'Area stanze','common.selectedFileCouldNotBeRead':'Impossibile leggere il file selezionato.','common.openingFileCancelled':"L'apertura del file è stata annullata.",'common.openingFileEllipsis':'Apertura di ','common.photoOrScreenshotFallback':'foto o screenshot','common.fileWasEmpty':'Il file era vuoto.','common.tryAnotherPictureScreenshot':"Prova con un'altra immagine o screenshot.",'common.checkingClipboardForDrawing':'Controllo degli appunti per un disegno…','common.drawingPastedFromClipboard':'Disegno incollato dagli appunti.','common.copyDrawingThenPasteHint':"Copia il disegno, poi premi Ctrl + V. L'area del disegno è pronta.",'common.installerNotesHeading':"Note per l'installatore",'common.accessOrderPlaceholder':'Accesso, ordine di lavoro, prese, battiscopa o altre istruzioni','common.inThisRoomHeading':'In questa stanza','common.panelsTapToRemove':'pannelli · tocca per rimuovere','common.noWardrobeCabinetYet':'Nessun armadio qui ancora.','common.addWardrobeCabinetHeading':'Aggiungi un armadio','common.panelsWord':'pannelli','common.noUnassignedUnits':"Nessuna unità non assegnata. Aggiungi prima un armadio o apri un'altra stanza.",'common.renameRoomBtn':'Rinomina stanza','common.deleteRoomBtn':'Elimina stanza','common.roomNamePrompt':'Nome della stanza:','common.wardrobeOrCabinetCount':'{0} armadio/i','common.placeUnitsBtn':'Posiziona {0} unità','common.tapRoomAddUnit':"Tocca una stanza, poi aggiungi l'unità",'common.noRoomSelectedYet':"Nessuna stanza selezionata ancora. Tocca Scegli stanza e tocca un'immagine.",'roomType.kitchen':'Cucina','roomType.livingRoom':'Soggiorno','roomType.tvWall':'Parete TV','roomType.masterBedroom':'Camera principale','roomType.bedroom':'Camera da letto','roomType.kidsBedroom':'Cameretta','roomType.dressingRoom':'Cabina armadio','roomType.bathroom':'Bagno','roomType.office':'Ufficio','roomType.laundry':'Lavanderia','roomType.utilityRoom':'Ripostiglio','roomType.hallway':'Corridoio','roomType.underStairs':'Sotto le scale','roomType.wineRoom':'Cantina','roomType.library':'Biblioteca','roomType.custom':'Personalizzato','common.chooseRoomHeading':'Scegli stanza','common.tapPictureRoomHelp':"Tocca l'immagine della stanza su cui stai lavorando. Puoi aggiungere lo stesso tipo di stanza più di una volta.",'common.typeRoomNamePlaceholder':'Scrivi il nome della stanza','common.addRoomBtn':'Aggiungi stanza','common.editJobHeading':'Modifica lavoro','common.jobNameLabel':'Nome del lavoro','common.customerLabel':'Cliente','common.cancelBtn':'Annulla','common.saveBtn':'Salva','common.createOrOpenJobNote':'Crea un nuovo lavoro o apri uno salvato.','common.untitledJob':'Lavoro senza titolo','common.addCustomer':'Aggiungi cliente','common.editBtn':'Modifica','common.chooseRoomBtn':'Scegli stanza','common.continueToDrawing':'➡ Continua al disegno','common.openDrawingBtn':'Apri disegno','common.roomsWord':'stanze','common.unitsWord':'unità','common.materialsWord':'materiali','common.piecesWord':'pezzi','common.oneUnit':'1 unità','common.unitsCount':'{0} unità','common.piecesCount':'{0} pezzi','common.selectedRoomPrefix':'Stanza selezionata · ','common.noCustomerName':'Nessun nome cliente','common.everythingReady':'Tutto pronto','common.checkRedCardsBeforeSending':'Controlla le schede rosse prima di inviare','common.qrPanelsTitle':'Pannelli QR','common.projectNotesTitle':'Note del progetto','common.roomsHeading':'Stanze','common.noRoomsYet':'Nessuna stanza ancora.','common.panelsNeedMoreInfo':'⚠ {0} pannello/i necessita(no) di più informazioni prima della lista di taglio.','common.noPanelsYetReturnDrawing':'Nessun pannello ancora. Torna a Disegno e contrassegna il primo pannello.','common.panelsReadyCount':'{0} di {1} pannelli pronti','common.longShortEdges':'{0} bordo/i lungo/lunghi · {1} bordo/i corto/corti','common.measurementsLabel':'Misure:','common.panelCheckedLabel':'Pannello verificato','common.panelNotCheckedLabel':'Pannello non verificato','common.doubleClickApprovePanel':'Doppio clic per approvare questo pannello','common.doubleClickAfterChecking':'Doppio clic dopo aver controllato questo pannello','common.buildChecklistHeading':'Lista di montaggio','common.hardwareChecklistHeading':'Lista ferramenta','common.tickedOffCount':'{0} di {1} spuntati','common.autoPickedUpHint':'Ogni pannello che nomini sul disegno viene ripreso qui automaticamente — non serve digitarlo.','common.addOwnElectricalPlaceholder':'Aggiungi il tuo, es. Pannello di accesso elettrico','common.addOwnSoftClosePlaceholder':'Aggiungi il tuo, es. Ammortizzatori soft-close','common.addBtnPlus':'+ Aggiungi','common.useSavedTemplateHeading':'Usare un modello salvato?','common.startFromPreviousHint':'Inizia questo armadio da un elenco di pannelli precedente, oppure parti da zero.','common.panelsHardwareCount':'{0} pannello/i · {1} ferramenta/e','common.startBlankBtn':'Inizia da zero','common.saveAsTemplateHeading':'Salva come modello','common.templateNameLabel':'Nome del modello','common.templateNamePlaceholder':'es. Armadio a due ante','common.saveTemplateBtn':'Salva modello','common.edgingConfirmationNeeded':'La bordatura e tutti i dettagli necessitano di conferma','common.editPanelBtn':'Modifica pannello','hardware.hinges':'Cerniere','hardware.handles':'Maniglie','hardware.shelfPins':'Reggipiano','hardware.ledLights':'Luci LED','hardware.ledDriverTransformer':'Driver/trasformatore LED','hardware.screwsFixings':'Viti e fissaggi','common.addedOnDrawing':'Aggiunto sul disegno','common.panelSavedToast':'Pannello salvato','common.panelSavedNextReady':'Pannello salvato · Prossimo pannello pronto','common.panelCouldNotBeSaved':'Impossibile salvare il pannello','common.addMainInfoHint':"Aggiungi le informazioni principali che l'installatore deve ricordare.",'common.accessOrderSpecialPlaceholder':'Accesso, ordine di lavoro, istruzioni speciali, luci o qualsiasi altra cosa importante','common.saveNotesBtn':'✓ Salva note','common.noWardrobeSelected':'Nessun armadio selezionato.','common.noCompletePartsReadySupplier':'Nessun pezzo completo è pronto per il fornitore. Aggiungi prima il nome, lo spessore, la lunghezza e la larghezza.','common.partTypeCount':'{0} tipo/i di pezzo','common.partNoHeader':'N. pezzo','common.panelDetailsHeader':'Dettagli pannello','common.descWhereGoesHeader':'Descrizione / dove va','common.noProjectSelected':'Nessun progetto selezionato.','common.noImageDrawingAvailable':'Nessun disegno immagine disponibile.','common.partHeader':'Pezzo','common.descriptionHeader':'Descrizione','common.statusHeaderPlain':'Stato','common.panelNotFound':'Pannello non trovato','common.drawingMissingFor':'Disegno mancante per {0}','common.openedOnDrawing':'{0} aperto sul disegno evidenziato','common.allowPopupsPrintQr':'Consenti i popup per stampare le etichette QR','common.qrCodesGenerated':'Codici QR generati','nav.home':'Home','nav.customers':'Clienti','nav.qrAndScan':'QR e scansione','nav.finishJob':'Termina lavoro','nav.settings':'Impostazioni','drawing.saveToCustomer':'Salva nel cliente','jobs.newJobCustomerPrompt':'Nome del cliente per questo lavoro?','drawing.enterCustomerNamePrompt':'Per quale cliente è questo lavoro?','common.savedToCustomerToast':'Salvato in {0}'
 },
 pt:{start:'Iniciar projeto',startHelp:'Introduza o trabalho e escolha o que está a construir. As divisões ficam no projeto e são enviadas para o telefone.',job:'Em que está a trabalhar?',summary:'Concluir trabalho',summaryHelp:'Uma última verificação visual; depois guarde ou envie uma nota à equipa de instalação.',finish:'Enviar para telefone ou iPad',noteLabel:'Nota para o telefone',noteHint:'É enviada sozinha, separada da lista de corte — útil para uma mensagem rápida sobre este trabalho, em qualquer fase.',notePlaceholder:'Exemplo: Armário do Red — o cliente quer dobradiças soft-close, confirmar antes de instalar.',noteSendBtn:'Enviar nota para o telefone',noteSendSmall:'Só esta nota, sem necessidade de lista de corte',
  'bom.pcsShort':'un','bomScreen.deleteJob':'Eliminar este trabalho','bomScreen.saveProject':'Guardar projeto','bomScreen.saveProjectSub':'Manter todas as alterações do Studio','bomScreen.templateCheck':'Verificação de modelo e ferragens','bomScreen.templateCheckSub':'Verifique novamente painéis, dobradiças, luzes, calhas, gavetas e ferragens antes de enviar.',
  'customers.addCustomer':'💾 Adicionar cliente','customers.address':'Morada','customers.backToCustomers':'← Clientes','customers.cancel':'Cancelar','customers.delete':'🗑 Eliminar','customers.edit':'✏️ Editar','customers.heading':'Clientes','customers.name':'Nome','customers.newCustomer':'+ Novo cliente','customers.phone':'Telefone','customers.save':'💾 Guardar','customers.searchPlaceholder':'Pesquisar clientes...','customers.subtitle':'Cada trabalho, guardado e organizado por cliente.',
  'drawing.back':'Voltar','drawing.catDoors':'Portas e gavetas','drawing.catInfills':'Enchimentos','drawing.catKitchen':'Móveis de cozinha','drawing.catTv':'Paredes e móveis de TV','drawing.catUtility':'Utilidade e peças especiais','drawing.catWardrobes':'Roupeiros e armários','drawing.checkAllPanels':'✓ Verificar todos os painéis','drawing.chooseDrawing':'Escolher desenho','drawing.chosenParts':'Peças escolhidas','drawing.delete':'Eliminar','drawing.dropHere':'Solte um desenho, captura ou foto aqui','drawing.dropHereHint':'Use os botões acima, arraste um desenho para esta caixa, ou pressione Ctrl + V depois de copiar uma captura de ecrã.','drawing.dropHereSub':'Cole, solte, escolha um ficheiro ou tire uma foto.','drawing.edgeBandingTitle':'Clique duas vezes para adicionar orla','drawing.edgeHelp':'Clique duas vezes no número de comprimento ou largura para adicionar orla: sem linha → uma linha → linha dupla.','drawing.fit':'Ajustar','drawing.fitDrawing':'Ajustar desenho','drawing.leftRight':'Esquerda / Direita','drawing.length':'Comprimento','drawing.makeUnique':'Tornar o marcador selecionado único','drawing.materialChooseOnce':'Material — escolha uma vez para este trabalho','drawing.materialHint':'Digite o nome exato do material usado neste trabalho.','drawing.materialPrefix':'Material','drawing.morePartNames':'Mais nomes de peças','drawing.noDrawing':'Sem desenho','drawing.noPanelSelected':'Nenhum painel selecionado','drawing.notesHint':'Adicionar ou usar outra nota','drawing.notesOptional':'Notas — opcional','drawing.notesPrefix':'Notas','drawing.panelOptions':'Opções do painel','drawing.partName':'Nome da peça','drawing.partNamePlaceholder':'Escolha ou digite um nome de peça…','drawing.partSelected':'Peça selecionada','drawing.pasteDrawing':'Colar desenho','drawing.pasteTitle':'Colar uma captura de ecrã ou imagem copiada','drawing.putSameNumber':'+ Colocar o mesmo número no desenho','drawing.quantity':'Quantidade','drawing.samePanelMarkers':'Mesmos marcadores de painel:','drawing.saveMaterial':'Guardar material','drawing.saveNext':'Guardar e seguinte','drawing.thickness':'Espessura','drawing.topBottom':'Cima / Baixo','drawing.width':'Largura','drawing.zoomIn':'Aumentar zoom','drawing.zoomOut':'Reduzir zoom',
  'home.addLabel':'Adicionar','home.addUnitBelow':'Adicione a unidade correta abaixo.','home.addWardrobe':'+ Adicionar roupeiro ou armário','home.back':'← Voltar','home.back2':'Voltar','home.backHome':'← Início','home.chooseRoomHeading':'Escolher divisão','home.chooseRoomHint':'Toque num botão grande de imagem. A divisão fica dentro deste projeto e é enviada automaticamente para o telemóvel.','home.chooseRoomHint2':'Escolha uma divisão acima, depois adicione o móvel correto para essa divisão.','home.continueJob':'Continuar trabalho atual','home.currentJobFallback':'Trabalho atual','home.customerLabel':'Cliente','home.customerPlaceholder':'Nome do cliente','home.customersJobs':'Clientes e trabalhos','home.customersJobsSub':'Ver todos os clientes e os seus projetos','home.jobNameHint':'Dê um nome ao trabalho uma vez, depois escolha a divisão em que está a trabalhar.','home.jobNameLabel':'Nome do trabalho','home.jobNamePlaceholder':'ex. Casa da Simone','home.newProject':'Novo projeto','home.newProjectSub':'Iniciar um novo cliente ou projeto','home.openJobHint':'Abra o trabalho em que está a trabalhar','home.recentJobs':'Trabalhos recentes','home.recentJobsSub':'Os seus trabalhos abertos recentemente','home.saveTemplateLater':'＋ Guardar um novo modelo mais tarde','home.selectedRoomPrefix':'Divisão selecionada:','home.siteJobs':'Trabalhos de obra','home.siteJobsNew':'Novos trabalhos enviados do seu telemóvel','home.siteJobsSub':'Fotos e medições do seu telemóvel','home.templateFourDoor':'Roupeiro de quatro portas','home.templateReady':'Pronto para a sua checklist guardada','home.templateThreeSliding':'Roupeiro de três portas de correr','home.templatesHeading':'🗂️ Os meus modelos','home.templatesSub':'A sua biblioteca personalizada viverá aqui.','home.unitCabinet':'armário','home.unitKitchen':'móvel de cozinha','home.unitLivingRoom':'móvel de sala','home.unitOffice':'móvel de escritório','home.unitTvWall':'parede de TV','home.unitUnderStairs':'móvel sob escada','home.unitWardrobeOrCabinet':'roupeiro ou armário','home.viewAll':'Ver tudo','home.welcomeSubtitle':'Planeie, projete e gira os seus projetos com facilidade.','home.welcomeTitle':'Bem-vindo ao AssembleOne Studio 👋','home.whatBuilding':'O que está a construir?',
  'parts.heading':'Verificação de painéis','parts.subtitle':'Verifique cada painel antes de fazer a lista de corte.',
  'phoneScreen.heading':'Guia de divisões','phoneScreen.part':'Peça','phoneScreen.subtitle':'O painel selecionado está destacado.',
  'qrScreen.generate':'Gerar códigos QR','qrScreen.heading':'Etiquetas QR — apenas armário selecionado','qrScreen.print':'Imprimir etiquetas QR','qrScreen.smartQr':'QR inteligente:','qrScreen.smartQrBody':'Digitalize dentro do AssembleOne para abrir exatamente o painel destacado. Quando a app móvel tiver um endereço web público, cole-o abaixo e a câmara normal do telemóvel também poderá abrir o painel diretamente.','qrScreen.subtitle':'Os códigos QR de outros trabalhos e armários são mantidos separados.','qrScreen.webAddress':'Endereço web da app móvel','qrScreen.webAddressHint':'Deixe isto vazio durante os testes locais. Depois digitalize com o leitor dentro do AssembleOne Mobile. O projeto publicado já deve estar aberto no telemóvel ou iPad.',
  'settingsScreen.appData':'Dados da app','settingsScreen.appDataHint':'Remova todos os trabalhos, desenhos e definições guardados neste dispositivo. Isto não pode ser desfeito.','settingsScreen.clearData':'Limpar todos os dados deste dispositivo','settingsScreen.cloudSync':'Sincronização na nuvem','settingsScreen.cloudSyncHint':'Este dispositivo sincroniza automaticamente com a app do telemóvel através da nuvem. Não é necessário iniciar sessão.','settingsScreen.heading':'Definições','settingsScreen.language':'Idioma','settingsScreen.languageHint':'Use o menu de bandeiras no topo do ecrã para mudar o idioma da app.','settingsScreen.subtitle':'Preferências da app e sincronização.','settingsScreen.unitCm':'Centímetros (cm)','settingsScreen.unitIn':'Polegadas (in)','settingsScreen.unitMm':'Milímetros (mm)','settingsScreen.units':'Unidades de medida','settingsScreen.unitsHint':'Escolha como os tamanhos dos painéis são mostrados e digitados no ecrã de Desenho.',
  sitePlanner:'Planeador de obra','siteScreen.addFloorPlan':'Adicione uma planta ou foto da obra. Depois escolha um ofício acima e toque na planta.','siteScreen.addMeasurement':'↔ Medição','siteScreen.addPlan':'Adicionar / mudar planta da obra','siteScreen.addWorkStage':'+ Etapa de trabalho','siteScreen.chooseTrade':'Escolha um ofício, depois toque no local exato na planta','siteScreen.chooseTradeMessage':'Escolha um ofício e envie uma mensagem do projeto.','siteScreen.pinHint':'O pin torna-se numa pequena conversa para todos que trabalham nesse ponto.','siteScreen.selectedPin':'Pin selecionado','siteScreen.showTrades':'Mostrar ofícios','siteScreen.subtitle':'Coloque trabalho, notas e conversas diretamente na planta ou foto da obra.','siteScreen.tapPin':'Toque num pin na planta.','siteScreen.tapPinHint':'Toque num pin para ler ou responder. Toque num local vazio depois de escolher um ofício para adicionar um novo pin.','siteScreen.tradeMessages':'Mensagens por ofício','siteScreen.workOrder':'Ordem de trabalho',
  "partname.Adjustable shelf":"Prateleira ajustável","partname.Appliance panel":"Painel de eletrodoméstico","partname.Back panel":"Painel traseiro","partname.Base bottom":"Inferior armário base","partname.Base shelf":"Prateleira armário base","partname.Base side":"Lateral de armário base","partname.Base top":"Superior armário base","partname.Batten":"Ripa de madeira","partname.Bench top":"Tampo de bancada","partname.Book shelf":"Estante de livros","partname.Bottom":"Inferior","partname.Bottom infill":"Preenchimento inferior","partname.Bracket":"Esquadro","partname.Cable panel":"Painel de cabos","partname.Centre divider":"Divisor central","partname.Cleat":"Sarrafo","partname.Clip":"Clip","partname.Cover panel":"Painel de cobertura","partname.Custom panel":"Painel personalizado","partname.Desk side":"Lateral de secretária","partname.Desk top":"Tampo de secretária","partname.Dishwasher panel":"Painel da máquina de loiça","partname.Divider":"Divisor","partname.Door":"Porta","partname.Drawer back":"Traseira de gaveta","partname.Drawer bottom":"Fundo de gaveta","partname.Drawer divider":"Divisor de gaveta","partname.Drawer front":"Frente de gaveta","partname.Drawer side":"Lateral de gaveta","partname.Drawer support":"Suporte de gaveta","partname.Dryer shelf":"Prateleira da secadora","partname.End panel":"Painel terminal","partname.Filler panel":"Painel de enchimento","partname.Fireplace panel":"Painel de lareira","partname.Fixed shelf":"Prateleira fixa","partname.Fridge panel":"Painel do frigorífico","partname.Glass shelf":"Prateleira de vidro","partname.Handle":"Puxador","partname.Hanging rail":"Cabide","partname.Hob rail":"Calha da placa","partname.Infill":"Preenchimento","partname.Kickboard":"Rodapé base","partname.LED profile":"Perfil LED","partname.Left door":"Porta esquerda","partname.Left infill":"Preenchimento esquerdo","partname.Left-hand side":"Lateral esquerda","partname.Light panel":"Painel de luz","partname.Mirror panel":"Painel de espelho","partname.Modesty panel":"Painel de proteção","partname.Oven rail":"Calha do forno","partname.Pair of doors":"Par de portas","partname.Plinth":"Rodapé","partname.Pocket door":"Porta de correr embutida","partname.Printer shelf":"Prateleira de impressora","partname.Right door":"Porta direita","partname.Right infill":"Preenchimento direito","partname.Right-hand side":"Lateral direita","partname.Scribe panel":"Painel de ajuste","partname.Seat top":"Tampo de assento","partname.Shelf":"Prateleira","partname.Side":"Lateral","partname.Side panel":"Painel lateral","partname.Sink rail":"Calha do lava-loiça","partname.Slatted panel":"Painel ripado","partname.Sliding door":"Porta de correr","partname.Speaker shelf":"Prateleira de coluna","partname.Splashback":"Painel anti-salpicos","partname.Support":"Suporte","partname.TV divider":"Divisor TV","partname.TV panel":"Painel de TV","partname.TV shelf":"Prateleira de TV","partname.TV side":"Lateral TV","partname.TV top":"Superior TV","partname.Tall cabinet side":"Lateral de armário alto","partname.Toe kick":"Rodapé inferior","partname.Top":"Superior","partname.Top and bottom":"Superior e inferior","partname.Top infill":"Preenchimento superior","partname.Utility shelf":"Prateleira de lavandaria","partname.Wall cabinet bottom":"Inferior armário superior","partname.Wall cabinet side":"Lateral de armário superior","partname.Wall cabinet top":"Superior armário superior","partname.Wall shelf":"Prateleira de parede","partname.Washer shelf":"Prateleira da máquina de lavar","partname.Wine shelf":"Prateleira de vinhos","partname.Worktop":"Bancada",
  'msg.noSitePicture':'Não há nenhuma foto do estaleiro disponível.','msg.sitePhotoBesideDrawing':'A foto do estaleiro está agora ao lado das ferramentas de desenho, como referência.','msg.confirmDeleteWardrobe':'Eliminar este roupeiro e todas as suas peças?','msg.openProjectFirst':'Abra primeiro um projeto.','msg.confirmDeleteRoomUnassigned':'Eliminar a divisão "{0}"? Os roupeiros ficarão sem atribuição.','msg.jobSaved':'Trabalho guardado.','msg.projectNotFound':'Projeto não encontrado.','msg.enterCustomerName':'Introduza o nome do cliente.','msg.customerAlreadyExists':'"{0}" já existe.','msg.confirmDeleteCustomer':'Eliminar "{0}"?\n\nEsta ação não pode ser anulada.','msg.confirmDeleteCustomerAndJobs':'Eliminar "{0}" e {1} trabalho(s)?\n\nEsta ação não pode ser anulada.','msg.siteUpdatesImported':'As atualizações do estaleiro foram importadas. O estado da instalação, as notas e as fotos estão agora novamente no Studio.','msg.notValidSiteUpdateZip':'Este não é um ficheiro ZIP de atualização de estaleiro AssembleOne válido.','msg.confirmDeleteWithoutSaving':'Eliminar "{0}" sem o guardar em nenhum lado?\n\nEsta ação não pode ser anulada.','msg.siteJobNoLongerWaiting':'Este trabalho de estaleiro já não está à espera.','msg.savedToCustomerJobs':'Guardado nos trabalhos de {0} — encontra-o sempre em Os meus projetos.','msg.couldNotSaveJobTryDrawing':'Não foi possível guardar este trabalho. Experimente Abrir desenho.','msg.noNewSiteJobsWaiting':'Não há novos trabalhos de estaleiro à espera.','msg.dropZipToReopen':'Largue um ficheiro .zip de trabalho AssembleOne para o reabrir.','msg.siteJobOpenedDrawing':'Trabalho de estaleiro aberto em Desenho. A foto das medições está pronta como referência.','msg.directSyncNotAvailableBackup':'A sincronização direta não está disponível aqui. Use Abrir ficheiro de cópia de segurança.','msg.projectOpenedInStudio':'Projeto aberto no AssembleOne Studio.','msg.notValidProjectZip':'Este não é um ficheiro ZIP de projeto AssembleOne válido.','msg.choosePictureScreenshotPdf':'Escolha uma imagem, uma captura de ecrã ou um ficheiro PDF.','msg.drawingTooLargeStorage':'O desenho é apresentado corretamente, mas é demasiado grande para o armazenamento permanente do navegador. Mantenha esta página aberta enquanto trabalha, ou use uma captura mais pequena.','msg.drawingCouldNotOpen':'Não foi possível abrir o desenho.','msg.notPictureFileTryDragging':'Esse item não é um ficheiro de imagem. Experimente arrastar um PNG ou JPG da pasta Transferências ou Imagens.','msg.forMarkingPanelsUsePngJpg':'Para marcar os painéis, use uma captura PNG ou JPG do PDF.','msg.confirmDeletePanel':'Eliminar {0}?','msg.markOrSelectPanelFirst':'Marque ou selecione primeiro um painel.','msg.markPanelFirst':'Marque primeiro um painel.','msg.choosePanelFirst':'Escolha primeiro um painel.','msg.allMarkersAlreadyOnDrawing':'Todas as {0} marcações já estão no desenho.','msg.setQuantityFirst':'Defina primeiro a Quantidade acima de 1, depois use isto para colocar uma marcação para cada uma, de cada vez.','msg.addedMoreMarkers':'Foram adicionadas mais {0} marcação/ões, pelo que todas as {1} estão agora no desenho. Arraste cada uma para a sua posição real e, depois, digitalize o seu próprio código QR assim que estiver montada.','msg.selectRepeatedMarkerFirst':'Selecione primeiro uma das marcações repetidas.','msg.noCompletePartsReady':'Não há peças completas prontas. Adicione primeiro o nome da peça, espessura, comprimento e largura.','msg.confirmRemovePin':'Remover este pin?','msg.confirmRemoveLinkedGroupChat':'Remover esta conversa de grupo associada?','msg.finishAllSectionsFirst':'Termine primeiro Início, Desenho, Painéis, Lista de corte e Etiquetas QR. Cada caixa fica verde quando estiver pronta.','msg.dropValidFileTypes':'Largue aqui um ficheiro PNG, JPG, WEBP ou PDF.','msg.printPreviewCouldNotOpen':'Não foi possível abrir a pré-visualização de impressão. Tente novamente.','msg.noCompletePanelsToPrint':'Não há painéis completos prontos para imprimir.','msg.generateQrCodesFirst':'Gere primeiro os códigos QR.','msg.openJobFirst':'Abra primeiro um trabalho.','msg.nothingSentNoUnit':'Nada foi enviado porque este trabalho ainda não tem nenhuma unidade.','msg.nothingSentNoPanels':'Nada foi enviado porque este trabalho ainda não tem painéis.','msg.confirmPanelsNotChecked':'{0} painel(éis) ainda não foram verificados (faltam detalhes ou não foram revistos). Enviar mesmo assim?','msg.cuttingListSent':'Lista de corte enviada: {0} painéis e {1} peças.','msg.siteJobSent':'Trabalho de estaleiro enviado: {0} divisão, {1} unidade, {2} painéis e {3} peças.','msg.phoneConnectionFailed':'A ligação ao telefone falhou. Verifique se ambos os dispositivos têm internet e tente novamente.','msg.typeNoteFirst':'Escreva primeiro uma nota.','msg.confirmClearAllData':'Isto remove todos os trabalhos, desenhos e definições guardados neste dispositivo. Esta ação não pode ser anulada. Continuar?','msg.addPanelBeforeTemplate':'Adicione pelo menos um painel antes de guardar um modelo.','msg.pleaseAddMissing':'Adicione: {0}','msg.samePartNumberAdded':'O mesmo número de peça foi adicionado novamente. Arraste a nova marcação para o painel correspondente.','msg.confirmDeleteJobBase':'Eliminar "{0}"?\n\nIsto elimina permanentemente todos os roupeiros, desenhos, painéis, listas de corte, etiquetas QR -- E quaisquer fotos ou medições guardadas para este trabalho.','msg.confirmDeleteJobPhotos':'\n\nEste trabalho tem {0} foto(s) guardada(s). Serão perdidas a menos que o telefone ainda as tenha e as reenvie.','msg.confirmDeleteJobSibling':'\n\n⚠️ Isto parece ser a divisão {0} de {1} da mesma visita ao estaleiro ({2}) -- certifique-se de que é esta que realmente quer eliminar, e não uma divisão confundida com um duplicado.','home.tagline':'Divisões · Listas de corte · Painéis QR','status.ready':'Pronto','status.installed':'Instalado','status.missing':'Em falta','status.damaged':'Danificado','common.unnamedPart':'Peça sem nome','common.notSet':'Não definido','common.qty':'Qtd.','common.noPanelsMarked':'Ainda não há painéis marcados.','common.material':'Material:','common.edging':'Orla:','common.notes':'Notas:','common.status':'Estado:','common.choosePartName':'Escolher o nome da peça','common.testQr':'Testar QR','common.notTestedYet':'Ainda não testado','common.noPartsInWardrobe':'Sem peças neste roupeiro.','common.markerXOfY':'marcação {0} de {1}','common.doubleClickTickOff':'clique duas vezes para marcar','common.noCompleteComponentsYet':'Ainda não há componentes completos. Termine primeiro o nome e todas as medidas.','step.start':'Início','step.drawing':'Desenho','step.panels':'Painéis','step.cuttingList':'Lista de corte','step.qrLabels':'Etiquetas QR','step.finish':'Concluir','common.completeFirstFiveStages':'Conclua as primeiras cinco etapas antes de enviar o projeto','common.openThisSection':'Abrir esta secção','common.sendCompletedProjectPhone':'Enviar o projeto concluído para o telemóvel ou iPad','common.completeAllFiveStepsFirst':'Conclua primeiro os cinco passos anteriores','common.readyToSend':'Pronto para enviar','common.completeEveryStepFirst':'Conclua primeiro todos os passos','common.completeSuffix':' concluído','common.notCompleteSuffix':' não concluído','common.openStepPrefix':'Abrir ','common.panelCheck':'Verificação de painéis','trade.builder':'Construtor','trade.bricklayer':'Pedreiro','trade.carpenter':'Carpinteiro','trade.electrician':'Eletricista','trade.plumber':'Canalizador','trade.decorator':'Pintor','trade.flooring':'Pavimentos','trade.wardrobes':'Roupeiros','trade.kitchenInstaller':'Instalador de cozinhas','trade.tiler':'Ladrilhador','trade.hvac':'Climatização','trade.heating':'Aquecimento','trade.windows':'Janelas','trade.doors':'Portas','trade.roofer':'Telhador','trade.steelworker':'Serralheiro','trade.landscaper':'Paisagista','trade.supplier':'Fornecedor','trade.client':'Cliente','trade.other':'Outro','trade.measurement':'Medição','common.move':'Mover','common.done':'Concluído','common.delete':'Eliminar','common.messagePrefix':'Mensagem para ','common.tapPinOnPlan':'Toca num pin no plano.','common.tradeLabel':'Ofício','common.roomAreaLabel':'Divisão / zona','common.bathroomExample':'Casa de banho','common.statusLabel':'Estado','common.pinStatusNew':'⚪ Novo','common.pinStatusWaiting':'🟡 Em espera','common.pinStatusDone':'🟢 Concluído','common.pinStatusProblem':'🔴 Problema','common.measurementTypeLabel':'Tipo de medição','common.wallToWall':'Parede a parede','common.measurementMmLabel':'Medição (mm)','common.mainNoteLabel':'Nota principal','common.whatNeedsDoingPlaceholder':'O que é preciso fazer aqui?','common.photoLabel':'Foto','common.savePinBtn':'Guardar pin','common.deletePinBtn':'Eliminar pin','common.conversationAtPin':'Conversa neste pin','common.noRepliesYet':'Ainda não há respostas.','common.writeShortReplyPlaceholder':'Escreve uma resposta curta…','common.sendBtn':'Enviar','common.dragTradePinToStart':'Arrasta um pin de ofício para cima de outro para iniciar uma conversa de grupo.','common.reopen':'Reabrir','common.markDone':'Marcar como concluído','common.deleteLink':'Eliminar ligação','common.noMessagesYet':'Ainda não há mensagens.','common.writeShortMessagePlaceholder':'Escreve uma mensagem curta…','common.stageWaiting':'Em espera','common.stageStarted':'Iniciado','common.stageDelayed':'Atrasado','common.stageReadyNext':'Pronto para o próximo ofício','common.stageComplete':'Concluído','common.addStagesHint':'Adiciona etapas apenas quando precisares de uma ordem de trabalho.','common.tradeOrStagePrompt':'Ofício ou etapa','common.noCustomersMatchSearch':'Nenhum cliente corresponde à tua pesquisa.','common.noCustomersYet':'Ainda não há clientes. Toca em "+ Novo cliente" para adicionar um, ou envia um Trabalho de estaleiro do teu telemóvel.','common.jobsCount':'{0} trabalho(s)','common.openInMapsLink':'Abrir no Maps ›','common.openPinnedLocationMaps':'📍 Abrir localização fixada no Maps ›','common.dragToTradeDbTitle':'Arrasta para a tua base de dados de ofícios, para o ambiente de trabalho ou para outra aplicação para guardar uma cópia deste trabalho','common.roomFallback':'Divisão','common.openArrowBtn':'Abrir ›','common.noJobsYetCustomer':'Ainda não há trabalhos para este cliente.','common.siblingRoomTag':'🔗 Divisão {0} de {1} da mesma visita ao estaleiro — não é um duplicado','common.customerNotNamed':'Cliente sem nome','common.newSiteJob':'Novo trabalho de estaleiro','common.roomNotNamed':'Divisão sem nome','common.newBadge':'NOVO','common.noNewJobsBadge':'Sem trabalhos novos','common.noNewSiteJobsList':'Sem novos trabalhos de estaleiro','common.jobCouldNotBeRead':'⚠ Não foi possível ler o trabalho','common.jobDataCorrupted':'Os dados deste trabalho estão corrompidos. Remove-o para não bloquear novos trabalhos.','common.remove':'Remover','common.removeWithoutOpening':'Remover sem abrir','common.saveToCustomer':'📁 Guardar no cliente','common.openDrawingArrow':'Abrir desenho ›','common.useBackupFile':'Usar ficheiro de cópia de segurança','common.directSyncUnavailableUseBackup':'Sincronização direta indisponível. Usa o ficheiro de cópia de segurança.','common.couldNotAddDrawing':'Não foi possível adicionar o desenho','common.roomsArea':'Área de divisões','common.selectedFileCouldNotBeRead':'Não foi possível ler o ficheiro selecionado.','common.openingFileCancelled':'A abertura do ficheiro foi cancelada.','common.openingFileEllipsis':'A abrir ','common.photoOrScreenshotFallback':'foto ou captura de ecrã','common.fileWasEmpty':'O ficheiro estava vazio.','common.tryAnotherPictureScreenshot':'Tenta outra imagem ou captura de ecrã.','common.checkingClipboardForDrawing':'A verificar a área de transferência para um desenho…','common.drawingPastedFromClipboard':'Desenho colado da área de transferência.','common.copyDrawingThenPasteHint':'Copia o desenho e depois prime Ctrl + V. A caixa de desenho está pronta.','common.installerNotesHeading':'Notas do instalador','common.accessOrderPlaceholder':'Acesso, ordem de trabalho, tomadas, rodapés ou outras instruções','common.inThisRoomHeading':'Nesta divisão','common.panelsTapToRemove':'painéis · toca para remover','common.noWardrobeCabinetYet':'Ainda não há nenhum roupeiro aqui.','common.addWardrobeCabinetHeading':'Adicionar um roupeiro','common.panelsWord':'painéis','common.noUnassignedUnits':'Sem unidades não atribuídas. Adiciona primeiro um roupeiro ou abre outra divisão.','common.renameRoomBtn':'Renomear divisão','common.deleteRoomBtn':'Eliminar divisão','common.roomNamePrompt':'Nome da divisão:','common.wardrobeOrCabinetCount':'{0} roupeiro(s)','common.placeUnitsBtn':'Colocar {0} unidade(s)','common.tapRoomAddUnit':'Toca numa divisão e depois adiciona a unidade','common.noRoomSelectedYet':'Ainda não foi selecionada nenhuma divisão. Prime Escolher divisão e toca numa imagem.','roomType.kitchen':'Cozinha','roomType.livingRoom':'Sala de estar','roomType.tvWall':'Parede de TV','roomType.masterBedroom':'Quarto principal','roomType.bedroom':'Quarto','roomType.kidsBedroom':'Quarto infantil','roomType.dressingRoom':'Closet','roomType.bathroom':'Casa de banho','roomType.office':'Escritório','roomType.laundry':'Lavandaria','roomType.utilityRoom':'Despensa','roomType.hallway':'Corredor','roomType.underStairs':'Debaixo da escada','roomType.wineRoom':'Adega','roomType.library':'Biblioteca','roomType.custom':'Personalizado','common.chooseRoomHeading':'Escolher divisão','common.tapPictureRoomHelp':'Toca na imagem da divisão em que estás a trabalhar. Podes adicionar o mesmo tipo de divisão mais de uma vez.','common.typeRoomNamePlaceholder':'Escreve o nome da divisão','common.addRoomBtn':'Adicionar divisão','common.editJobHeading':'Editar trabalho','common.jobNameLabel':'Nome do trabalho','common.customerLabel':'Cliente','common.cancelBtn':'Cancelar','common.saveBtn':'Guardar','common.createOrOpenJobNote':'Cria um novo trabalho ou abre um guardado.','common.untitledJob':'Trabalho sem título','common.addCustomer':'Adicionar cliente','common.editBtn':'Editar','common.chooseRoomBtn':'Escolher divisão','common.continueToDrawing':'➡ Continuar para o desenho','common.openDrawingBtn':'Abrir desenho','common.roomsWord':'divisões','common.unitsWord':'unidades','common.materialsWord':'materiais','common.piecesWord':'peças','common.oneUnit':'1 unidade','common.unitsCount':'{0} unidades','common.piecesCount':'{0} peças','common.selectedRoomPrefix':'Divisão selecionada · ','common.noCustomerName':'Sem nome de cliente','common.everythingReady':'Tudo pronto','common.checkRedCardsBeforeSending':'Verifica os cartões vermelhos antes de enviar','common.qrPanelsTitle':'Painéis QR','common.projectNotesTitle':'Notas do projeto','common.roomsHeading':'Divisões','common.noRoomsYet':'Ainda não há divisões.','common.panelsNeedMoreInfo':'⚠ {0} painel(éis) precisa(m) de mais informação antes da lista de corte.','common.noPanelsYetReturnDrawing':'Ainda não há painéis. Volta a Desenho e marca o primeiro painel.','common.panelsReadyCount':'{0} de {1} painéis prontos','common.longShortEdges':'{0} orla(s) longa(s) · {1} orla(s) curta(s)','common.measurementsLabel':'Medidas:','common.panelCheckedLabel':'Painel verificado','common.panelNotCheckedLabel':'Painel não verificado','common.doubleClickApprovePanel':'Clique duas vezes para aprovar este painel','common.doubleClickAfterChecking':'Clique duas vezes depois de verificar este painel','common.buildChecklistHeading':'Lista de construção','common.hardwareChecklistHeading':'Lista de ferragens','common.tickedOffCount':'{0} de {1} marcados','common.autoPickedUpHint':'Cada painel que nomeias no desenho aparece aqui automaticamente — não é preciso escrevê-lo.','common.addOwnElectricalPlaceholder':'Adiciona o teu, ex. Painel de acesso elétrico','common.addOwnSoftClosePlaceholder':'Adiciona o teu, ex. Amortecedores soft-close','common.addBtnPlus':'+ Adicionar','common.useSavedTemplateHeading':'Usar um modelo guardado?','common.startFromPreviousHint':'Inicia este roupeiro a partir de uma lista de painéis anterior, ou começa em branco.','common.panelsHardwareCount':'{0} painel(éis) · {1} ferragem(ns)','common.startBlankBtn':'Começar em branco','common.saveAsTemplateHeading':'Guardar como modelo','common.templateNameLabel':'Nome do modelo','common.templateNamePlaceholder':'ex. Roupeiro de duas portas','common.saveTemplateBtn':'Guardar modelo','common.edgingConfirmationNeeded':'A orla e todos os detalhes precisam de confirmação','common.editPanelBtn':'Editar painel','hardware.hinges':'Dobradiças','hardware.handles':'Puxadores','hardware.shelfPins':'Suportes de prateleira','hardware.ledLights':'Luzes LED','hardware.ledDriverTransformer':'Driver/transformador LED','hardware.screwsFixings':'Parafusos e fixações','common.addedOnDrawing':'Adicionado no desenho','common.panelSavedToast':'Painel guardado','common.panelSavedNextReady':'Painel guardado · Próximo painel pronto','common.panelCouldNotBeSaved':'Não foi possível guardar o painel','common.addMainInfoHint':'Adiciona a informação principal que o instalador deve lembrar.','common.accessOrderSpecialPlaceholder':'Acesso, ordem de trabalho, instruções especiais, luzes ou qualquer coisa importante','common.saveNotesBtn':'✓ Guardar notas','common.noWardrobeSelected':'Nenhum roupeiro selecionado.','common.noCompletePartsReadySupplier':'Não há peças completas prontas para o fornecedor. Adiciona primeiro o nome, a espessura, o comprimento e a largura.','common.partTypeCount':'{0} tipo(s) de peça','common.partNoHeader':'N.º da peça','common.panelDetailsHeader':'Detalhes do painel','common.descWhereGoesHeader':'Descrição / onde vai','common.noProjectSelected':'Nenhum projeto selecionado.','common.noImageDrawingAvailable':'Nenhum desenho de imagem disponível.','common.partHeader':'Peça','common.descriptionHeader':'Descrição','common.statusHeaderPlain':'Estado','common.panelNotFound':'Painel não encontrado','common.drawingMissingFor':'Falta o desenho de {0}','common.openedOnDrawing':'{0} aberto no desenho destacado','common.allowPopupsPrintQr':'Permite pop-ups para imprimir etiquetas QR','common.qrCodesGenerated':'Códigos QR gerados','nav.home':'Início','nav.customers':'Clientes','nav.qrAndScan':'QR e digitalização','nav.finishJob':'Concluir trabalho','nav.settings':'Definições','drawing.saveToCustomer':'Guardar no cliente','jobs.newJobCustomerPrompt':'Nome do cliente para este trabalho?','drawing.enterCustomerNamePrompt':'Para que cliente é este trabalho?','common.savedToCustomerToast':'Guardado em {0}'
 },
 nl:{start:'Project starten',startHelp:'Vul de klus in en kies wat je bouwt. Kamers blijven in het project en worden naar de telefoon gestuurd.',job:'Waar werk je aan?',summary:'Klus afronden',summaryHelp:'Een laatste visuele controle, sla daarna op of stuur een notitie naar het installatieteam.',finish:'Naar telefoon of iPad sturen',noteLabel:'Notitie voor de telefoon',noteHint:'Wordt apart verzonden, los van de zaaglijst — handig voor een snel bericht over deze klus, in elke fase.',notePlaceholder:'Voorbeeld: Kast van Red — klant wil soft-close scharnieren, bevestig voor montage.',noteSendBtn:'Notitie naar telefoon sturen',noteSendSmall:'Alleen deze notitie, geen zaaglijst nodig',
  'bom.pcsShort':'stuks','bomScreen.deleteJob':'Deze klus verwijderen','bomScreen.saveProject':'Project opslaan','bomScreen.saveProjectSub':'Alle Studio-wijzigingen behouden','bomScreen.templateCheck':'Sjabloon- en beslagcontrole','bomScreen.templateCheckSub':'Controleer panelen, scharnieren, verlichting, rails, laden en beslag nogmaals voor verzending.',
  'customers.addCustomer':'💾 Klant toevoegen','customers.address':'Adres','customers.backToCustomers':'← Klanten','customers.cancel':'Annuleren','customers.delete':'🗑 Verwijderen','customers.edit':'✏️ Bewerken','customers.heading':'Klanten','customers.name':'Naam','customers.newCustomer':'+ Nieuwe klant','customers.phone':'Telefoon','customers.save':'💾 Opslaan','customers.searchPlaceholder':'Klanten zoeken...','customers.subtitle':'Elke klus, opgeslagen en georganiseerd per klant.',
  'drawing.back':'Terug','drawing.catDoors':'Deuren en laden','drawing.catInfills':'Opvullingen','drawing.catKitchen':'Keukenkasten','drawing.catTv':'TV-wanden en meubels','drawing.catUtility':'Bijkeuken en speciale onderdelen','drawing.catWardrobes':'Kasten en garderobekasten','drawing.checkAllPanels':'✓ Alle panelen controleren','drawing.chooseDrawing':'Tekening kiezen','drawing.chosenParts':'Gekozen onderdelen','drawing.delete':'Verwijderen','drawing.dropHere':'Sleep een tekening, screenshot of foto hierheen','drawing.dropHereHint':'Gebruik de knoppen hierboven, sleep een tekening in dit vak, of druk op Ctrl + V na het kopiëren van een screenshot.','drawing.dropHereSub':'Plak, sleep, kies een bestand of maak een foto.','drawing.edgeBandingTitle':'Dubbelklik om kantenband toe te voegen','drawing.edgeHelp':'Dubbelklik op het lengte- of breedtegetal om kantenband toe te voegen: geen lijn → één lijn → dubbele lijn.','drawing.fit':'Passend maken','drawing.fitDrawing':'Tekening passend maken','drawing.leftRight':'Links / Rechts','drawing.length':'Lengte','drawing.makeUnique':'Geselecteerde markering uniek maken','drawing.materialChooseOnce':'Materiaal — eenmaal kiezen voor deze klus','drawing.materialHint':'Typ de exacte materiaalnaam gebruikt voor deze klus.','drawing.materialPrefix':'Materiaal','drawing.morePartNames':'Meer onderdeelnamen','drawing.noDrawing':'Geen tekening','drawing.noPanelSelected':'Geen paneel geselecteerd','drawing.notesHint':'Voeg een andere notitie toe of gebruik er een','drawing.notesOptional':'Notities — optioneel','drawing.notesPrefix':'Notities','drawing.panelOptions':'Paneelopties','drawing.partName':'Onderdeelnaam','drawing.partNamePlaceholder':'Kies of typ een onderdeelnaam…','drawing.partSelected':'Onderdeel geselecteerd','drawing.pasteDrawing':'Tekening plakken','drawing.pasteTitle':'Een gekopieerde screenshot of afbeelding plakken','drawing.putSameNumber':'+ Zelfde nummer op tekening zetten','drawing.quantity':'Aantal','drawing.samePanelMarkers':'Zelfde paneelmarkeringen:','drawing.saveMaterial':'Materiaal opslaan','drawing.saveNext':'Opslaan & volgende','drawing.thickness':'Dikte','drawing.topBottom':'Boven / Onder','drawing.width':'Breedte','drawing.zoomIn':'Inzoomen','drawing.zoomOut':'Uitzoomen',
  'home.addLabel':'Toevoegen','home.addUnitBelow':'Voeg de juiste eenheid hieronder toe.','home.addWardrobe':'+ Kast of kledingkast toevoegen','home.back':'← Terug','home.back2':'Terug','home.backHome':'← Start','home.chooseRoomHeading':'Kamer kiezen','home.chooseRoomHint':'Tik op een grote afbeeldingsknop. De kamer blijft in dit project en wordt automatisch naar de telefoon gestuurd.','home.chooseRoomHint2':'Kies hierboven een kamer, voeg dan het juiste meubel voor die kamer toe.','home.continueJob':'Huidige klus voortzetten','home.currentJobFallback':'Huidige klus','home.customerLabel':'Klant','home.customerPlaceholder':'Klantnaam','home.customersJobs':'Klanten en klussen','home.customersJobsSub':'Bekijk alle klanten en hun projecten','home.jobNameHint':'Geef de klus eenmaal een naam, kies dan de kamer waaraan je werkt.','home.jobNameLabel':'Klusnaam','home.jobNamePlaceholder':'bijv. Huis van Simone','home.newProject':'Nieuw project','home.newProjectSub':'Start een nieuwe klant of project','home.openJobHint':'Open de klus waaraan je werkt','home.recentJobs':'Recente klussen','home.recentJobsSub':'Je onlangs geopende klussen','home.saveTemplateLater':'＋ Later een nieuw sjabloon opslaan','home.selectedRoomPrefix':'Geselecteerde kamer:','home.siteJobs':'Bouwplaatsklussen','home.siteJobsNew':'Nieuwe klussen verstuurd vanaf je telefoon','home.siteJobsSub':'Foto\'s en metingen van je telefoon','home.templateFourDoor':'Kledingkast met vier deuren','home.templateReady':'Klaar voor je opgeslagen checklist','home.templateThreeSliding':'Kledingkast met drie schuifdeuren','home.templatesHeading':'🗂️ Mijn sjablonen','home.templatesSub':'Je aangepaste bibliotheek komt hier.','home.unitCabinet':'kast','home.unitKitchen':'keukenelement','home.unitLivingRoom':'woonkamerelement','home.unitOffice':'kantoorelement','home.unitTvWall':'TV-wand','home.unitUnderStairs':'element onder de trap','home.unitWardrobeOrCabinet':'kast of kledingkast','home.viewAll':'Alles bekijken','home.welcomeSubtitle':'Plan, ontwerp en beheer je projecten met gemak.','home.welcomeTitle':'Welkom bij AssembleOne Studio 👋','home.whatBuilding':'Wat ben je aan het bouwen?',
  'parts.heading':'Paneelcontrole','parts.subtitle':'Controleer elk paneel voordat je de zaaglijst maakt.',
  'phoneScreen.heading':'Kamergids','phoneScreen.part':'Onderdeel','phoneScreen.subtitle':'Het geselecteerde paneel is gemarkeerd.',
  'qrScreen.generate':'QR-codes genereren','qrScreen.heading':'QR-labels — alleen geselecteerde kast','qrScreen.print':'QR-labels afdrukken','qrScreen.smartQr':'Slimme QR:','qrScreen.smartQrBody':'Scan binnen AssembleOne om precies het gemarkeerde paneel te openen. Als de mobiele app een openbaar webadres heeft, plak het hieronder en kan de normale telefooncamera het paneel ook direct openen.','qrScreen.subtitle':'QR-codes van andere klussen en kasten worden gescheiden gehouden.','qrScreen.webAddress':'Webadres van mobiele app','qrScreen.webAddressHint':'Laat dit leeg tijdens lokaal testen. Scan dan met de scanner binnen AssembleOne Mobile. Het gepubliceerde project moet al geopend zijn op de telefoon of iPad.',
  'settingsScreen.appData':'App-gegevens','settingsScreen.appDataHint':'Verwijder alle klussen, tekeningen en instellingen die op dit apparaat zijn opgeslagen. Dit kan niet ongedaan worden gemaakt.','settingsScreen.clearData':'Alle gegevens op dit apparaat wissen','settingsScreen.cloudSync':'Cloudsynchronisatie','settingsScreen.cloudSyncHint':'Dit apparaat synchroniseert automatisch met de telefoonapp via de cloud. Geen aanmelding vereist.','settingsScreen.heading':'Instellingen','settingsScreen.language':'Taal','settingsScreen.languageHint':'Gebruik het vlaggenmenu bovenaan het scherm om de apptaal te wijzigen.','settingsScreen.subtitle':'App-voorkeuren en synchronisatie.','settingsScreen.unitCm':'Centimeters (cm)','settingsScreen.unitIn':'Inches (in)','settingsScreen.unitMm':'Millimeters (mm)','settingsScreen.units':'Meeteenheden','settingsScreen.unitsHint':'Kies hoe paneelafmetingen worden weergegeven en ingevoerd op het tekenscherm.',
  sitePlanner:'Bouwplaatsplanner','siteScreen.addFloorPlan':'Voeg een plattegrond of bouwplaatsfoto toe. Kies dan hierboven een vakgebied en tik op de plattegrond.','siteScreen.addMeasurement':'↔ Meting','siteScreen.addPlan':'Bouwplaatsplan toevoegen / wijzigen','siteScreen.addWorkStage':'+ Werkfase','siteScreen.chooseTrade':'Kies een vakgebied, tik dan op de exacte plek op de plattegrond','siteScreen.chooseTradeMessage':'Kies een vakgebied en stuur een projectbericht.','siteScreen.pinHint':'De pin wordt een klein gesprek voor iedereen die op dat punt werkt.','siteScreen.selectedPin':'Geselecteerde pin','siteScreen.showTrades':'Vakgebieden tonen','siteScreen.subtitle':'Zet werk, notities en gesprekken direct op de plattegrond of bouwplaatsfoto.','siteScreen.tapPin':'Tik op een pin op de plattegrond.','siteScreen.tapPinHint':'Tik op een pin om te lezen of te reageren. Tik op een lege plek na het kiezen van een vakgebied om een nieuwe pin toe te voegen.','siteScreen.tradeMessages':'Berichten per vakgebied','siteScreen.workOrder':'Werkorder',
  "partname.Adjustable shelf":"Verstelbare plank","partname.Appliance panel":"Apparaatpaneel","partname.Back panel":"Achterpaneel","partname.Base bottom":"Onderkastbodem","partname.Base shelf":"Onderkastplank","partname.Base side":"Onderkastzijde","partname.Base top":"Onderkastbovenkant","partname.Batten":"Houten lat","partname.Bench top":"Bankblad","partname.Book shelf":"Boekenplank","partname.Bottom":"Onderkant","partname.Bottom infill":"Onderste opvulling","partname.Bracket":"Beugel","partname.Cable panel":"Kabelpaneel","partname.Centre divider":"Middenschot","partname.Cleat":"Lat","partname.Clip":"Clip","partname.Cover panel":"Afdekpaneel","partname.Custom panel":"Aangepast paneel","partname.Desk side":"Bureauzijde","partname.Desk top":"Bureaublad","partname.Dishwasher panel":"Vaatwasserpaneel","partname.Divider":"Tussenschot","partname.Door":"Deur","partname.Drawer back":"Ladeachterkant","partname.Drawer bottom":"Ladebodem","partname.Drawer divider":"Ladeverdeler","partname.Drawer front":"Ladefront","partname.Drawer side":"Ladezijde","partname.Drawer support":"Ladesteun","partname.Dryer shelf":"Drogerplank","partname.End panel":"Eindpaneel","partname.Filler panel":"Vulpaneel","partname.Fireplace panel":"Haardpaneel","partname.Fixed shelf":"Vaste plank","partname.Fridge panel":"Koelkastpaneel","partname.Glass shelf":"Glazen plank","partname.Handle":"Handgreep","partname.Hanging rail":"Kledingroede","partname.Hob rail":"Kookplaatrail","partname.Infill":"Opvulling","partname.Kickboard":"Plint","partname.LED profile":"LED-profiel","partname.Left door":"Linkerdeur","partname.Left infill":"Linker opvulling","partname.Left-hand side":"Linkerzijde","partname.Light panel":"Lichtpaneel","partname.Mirror panel":"Spiegelpaneel","partname.Modesty panel":"Beenschot","partname.Oven rail":"Ovenrail","partname.Pair of doors":"Deurenpaar","partname.Plinth":"Plint","partname.Pocket door":"Wegschuifdeur","partname.Printer shelf":"Printerplank","partname.Right door":"Rechterdeur","partname.Right infill":"Rechter opvulling","partname.Right-hand side":"Rechterzijde","partname.Scribe panel":"Aanpassingspaneel","partname.Seat top":"Zitblad","partname.Shelf":"Plank","partname.Side":"Zijkant","partname.Side panel":"Zijpaneel","partname.Sink rail":"Gootsteenrail","partname.Slatted panel":"Lattenpaneel","partname.Sliding door":"Schuifdeur","partname.Speaker shelf":"Speakerplank","partname.Splashback":"Spatwand","partname.Support":"Steun","partname.TV divider":"TV-tussenschot","partname.TV panel":"TV-paneel","partname.TV shelf":"TV-plank","partname.TV side":"TV-zijkant","partname.TV top":"TV-bovenkant","partname.Tall cabinet side":"Hoge kastzijde","partname.Toe kick":"Onderplint","partname.Top":"Bovenkant","partname.Top and bottom":"Boven en onder","partname.Top infill":"Bovenste opvulling","partname.Utility shelf":"Bijkeukenplank","partname.Wall cabinet bottom":"Bovenkastbodem","partname.Wall cabinet side":"Bovenkastzijde","partname.Wall cabinet top":"Bovenkastbovenkant","partname.Wall shelf":"Wandplank","partname.Washer shelf":"Wasmachineplank","partname.Wine shelf":"Wijnplank","partname.Worktop":"Werkblad",
  'msg.noSitePicture':'Er is geen bouwplaatsfoto beschikbaar.','msg.sitePhotoBesideDrawing':'De bouwplaatsfoto staat nu naast de tekengereedschappen, als referentie.','msg.confirmDeleteWardrobe':'Deze kast en alle onderdelen verwijderen?','msg.openProjectFirst':'Open eerst een project.','msg.confirmDeleteRoomUnassigned':'Kamer "{0}" verwijderen? Kasten blijven niet-toegewezen.','msg.jobSaved':'Klus opgeslagen.','msg.projectNotFound':'Project niet gevonden.','msg.enterCustomerName':'Voer de naam van de klant in.','msg.customerAlreadyExists':'"{0}" bestaat al.','msg.confirmDeleteCustomer':'"{0}" verwijderen?\n\nDeze actie kan niet ongedaan worden gemaakt.','msg.confirmDeleteCustomerAndJobs':'"{0}" en {1} klus(sen) verwijderen?\n\nDeze actie kan niet ongedaan worden gemaakt.','msg.siteUpdatesImported':'Bouwplaatsupdates zijn geïmporteerd. Installatiestatus, notities en foto\'s staan nu weer in Studio.','msg.notValidSiteUpdateZip':'Dit is geen geldig AssembleOne-bouwplaatsupdate ZIP-bestand.','msg.confirmDeleteWithoutSaving':'"{0}" verwijderen zonder het ergens op te slaan?\n\nDeze actie kan niet ongedaan worden gemaakt.','msg.siteJobNoLongerWaiting':'Deze bouwplaatsklus wacht niet meer.','msg.savedToCustomerJobs':'Opgeslagen bij de klussen van {0} — altijd terug te vinden via Mijn projecten.','msg.couldNotSaveJobTryDrawing':'Deze klus kon niet worden opgeslagen. Probeer in plaats daarvan Tekening openen.','msg.noNewSiteJobsWaiting':'Geen nieuwe bouwplaatsklussen in de wacht.','msg.dropZipToReopen':'Sleep een AssembleOne .zip-klusbestand hierheen om het opnieuw te openen.','msg.siteJobOpenedDrawing':'Bouwplaatsklus geopend in Tekening. De opmetingsfoto staat klaar als referentie.','msg.directSyncNotAvailableBackup':'Directe synchronisatie is hier niet beschikbaar. Gebruik Back-upbestand openen.','msg.projectOpenedInStudio':'Project geopend in AssembleOne Studio.','msg.notValidProjectZip':'Dit is geen geldig AssembleOne-project ZIP-bestand.','msg.choosePictureScreenshotPdf':'Kies een afbeelding, schermafbeelding of PDF-bestand.','msg.drawingTooLargeStorage':'De tekening wordt correct weergegeven, maar is te groot voor permanente opslag in de browser. Houd deze pagina open terwijl je werkt, of gebruik een kleinere schermafbeelding.','msg.drawingCouldNotOpen':'De tekening kon niet worden geopend.','msg.notPictureFileTryDragging':'Dat item is geen afbeeldingsbestand. Probeer een PNG of JPG te slepen vanuit de map Downloads of Afbeeldingen.','msg.forMarkingPanelsUsePngJpg':'Gebruik voor het markeren van panelen een PNG- of JPG-schermafbeelding van de PDF.','msg.confirmDeletePanel':'{0} verwijderen?','msg.markOrSelectPanelFirst':'Markeer of selecteer eerst een paneel.','msg.markPanelFirst':'Markeer eerst een paneel.','msg.choosePanelFirst':'Kies eerst een paneel.','msg.allMarkersAlreadyOnDrawing':'Alle {0} markeringen staan al op de tekening.','msg.setQuantityFirst':'Zet eerst Aantal boven 1, gebruik dit vervolgens om voor elk stuk om de beurt een markering te plaatsen.','msg.addedMoreMarkers':'Er zijn {0} extra markering(en) toegevoegd, zodat alle {1} nu op de tekening staan. Sleep elke naar de werkelijke plek en scan daarna de eigen QR-code zodra deze gemonteerd is.','msg.selectRepeatedMarkerFirst':'Selecteer eerst een van de herhaalde markeringen.','msg.noCompletePartsReady':'Geen complete onderdelen gereed. Voeg eerst onderdeelnaam, dikte, lengte en breedte toe.','msg.confirmRemovePin':'Deze pin verwijderen?','msg.confirmRemoveLinkedGroupChat':'Deze gekoppelde groepschat verwijderen?','msg.finishAllSectionsFirst':'Voltooi eerst Start, Tekening, Panelen, Zaaglijst en QR-labels. Elk vak wordt groen zodra het klaar is.','msg.dropValidFileTypes':'Sleep hier een PNG-, JPG-, WEBP- of PDF-bestand naartoe.','msg.printPreviewCouldNotOpen':'Afdrukvoorbeeld kon niet worden geopend. Probeer het opnieuw.','msg.noCompletePanelsToPrint':'Geen complete panelen gereed om af te drukken.','msg.generateQrCodesFirst':'Genereer eerst de QR-codes.','msg.openJobFirst':'Open eerst een klus.','msg.nothingSentNoUnit':'Er is niets verzonden omdat deze klus nog geen kastunit heeft.','msg.nothingSentNoPanels':'Er is niets verzonden omdat deze klus nog geen panelen heeft.','msg.confirmPanelsNotChecked':'{0} paneel/panelen zijn nog niet gecontroleerd (details ontbreken of niet beoordeeld). Toch verzenden?','msg.cuttingListSent':'Zaaglijst verzonden: {0} panelen en {1} onderdelen.','msg.siteJobSent':'Bouwplaatsklus verzonden: {0} kamer, {1} unit, {2} panelen en {3} onderdelen.','msg.phoneConnectionFailed':'Verbinding met telefoon mislukt. Controleer of beide apparaten internet hebben en probeer het opnieuw.','msg.typeNoteFirst':'Schrijf eerst een notitie.','msg.confirmClearAllData':'Dit verwijdert alle klussen, tekeningen en instellingen die op dit apparaat zijn opgeslagen. Deze actie kan niet ongedaan worden gemaakt. Doorgaan?','msg.addPanelBeforeTemplate':'Voeg minstens één paneel toe voordat je een sjabloon opslaat.','msg.pleaseAddMissing':'Voeg toe: {0}','msg.samePartNumberAdded':'Hetzelfde onderdeelnummer is opnieuw toegevoegd. Sleep de nieuwe markering naar het bijbehorende paneel.','msg.confirmDeleteJobBase':"\"{0}\" verwijderen?\n\nDit verwijdert permanent alle kasten, tekeningen, panelen, zaaglijsten, QR-labels -- EN alle foto's of metingen die voor deze klus zijn opgeslagen.",'msg.confirmDeleteJobPhotos':"\n\nDeze klus heeft {0} opgeslagen foto's. Deze gaan verloren tenzij de telefoon ze nog heeft en je ze opnieuw verstuurt.",'msg.confirmDeleteJobSibling':'\n\n⚠️ Dit lijkt kamer {0} van {1} te zijn van hetzelfde bezoek aan de bouwplaats ({2}) -- zorg ervoor dat dit de kamer is die je echt wilt verwijderen, en niet een kamer die je per ongeluk voor een duplicaat hebt aangezien.','home.tagline':'Kamers · Zaaglijsten · QR-panelen','status.ready':'Klaar','status.installed':'Geïnstalleerd','status.missing':'Ontbreekt','status.damaged':'Beschadigd','common.unnamedPart':'Naamloos onderdeel','common.notSet':'Niet ingesteld','common.qty':'Aantal','common.noPanelsMarked':'Nog geen panelen gemarkeerd.','common.material':'Materiaal:','common.edging':'Kantenband:','common.notes':'Notities:','common.status':'Status:','common.choosePartName':'Kies onderdeelnaam','common.testQr':'QR testen','common.notTestedYet':'Nog niet getest','common.noPartsInWardrobe':'Geen onderdelen in deze kast.','common.markerXOfY':'markering {0} van {1}','common.doubleClickTickOff':'dubbelklik om af te vinken','common.noCompleteComponentsYet':'Nog geen complete onderdelen. Vul eerst de naam en alle afmetingen in.','step.start':'Start','step.drawing':'Tekening','step.panels':'Panelen','step.cuttingList':'Zaaglijst','step.qrLabels':'QR-labels','step.finish':'Voltooien','common.completeFirstFiveStages':'Voltooi de eerste vijf stappen voordat je het project verstuurt','common.openThisSection':'Deze sectie openen','common.sendCompletedProjectPhone':'Stuur het voltooide project naar telefoon of iPad','common.completeAllFiveStepsFirst':'Voltooi eerst alle vijf voorgaande stappen','common.readyToSend':'Klaar om te versturen','common.completeEveryStepFirst':'Voltooi eerst alle stappen','common.completeSuffix':' voltooid','common.notCompleteSuffix':' niet voltooid','common.openStepPrefix':'Open ','common.panelCheck':'Panelcontrole','trade.builder':'Bouwer','trade.bricklayer':'Metselaar','trade.carpenter':'Timmerman','trade.electrician':'Elektricien','trade.plumber':'Loodgieter','trade.decorator':'Schilder','trade.flooring':'Vloeren','trade.wardrobes':'Kasten','trade.kitchenInstaller':'Keukenmonteur','trade.tiler':'Tegelzetter','trade.hvac':'Klimaattechniek','trade.heating':'Verwarming','trade.windows':'Ramen','trade.doors':'Deuren','trade.roofer':'Dakdekker','trade.steelworker':'Staalbouwer','trade.landscaper':'Hovenier','trade.supplier':'Leverancier','trade.client':'Klant','trade.other':'Overig','trade.measurement':'Meting','common.move':'Verplaatsen','common.done':'Klaar','common.delete':'Verwijderen','common.messagePrefix':'Bericht aan ','common.tapPinOnPlan':'Tik op een pin op het plan.','common.tradeLabel':'Vak','common.roomAreaLabel':'Kamer / zone','common.bathroomExample':'Badkamer','common.statusLabel':'Status','common.pinStatusNew':'⚪ Nieuw','common.pinStatusWaiting':'🟡 Wachtend','common.pinStatusDone':'🟢 Klaar','common.pinStatusProblem':'🔴 Probleem','common.measurementTypeLabel':'Metingtype','common.wallToWall':'Muur tot muur','common.measurementMmLabel':'Meting (mm)','common.mainNoteLabel':'Hoofdnotitie','common.whatNeedsDoingPlaceholder':'Wat moet hier gebeuren?','common.photoLabel':'Foto','common.savePinBtn':'Pin opslaan','common.deletePinBtn':'Pin verwijderen','common.conversationAtPin':'Gesprek bij deze pin','common.noRepliesYet':'Nog geen reacties.','common.writeShortReplyPlaceholder':'Schrijf een kort antwoord…','common.sendBtn':'Verstuur','common.dragTradePinToStart':'Sleep een vakpin op een andere om een groepschat te starten.','common.reopen':'Heropenen','common.markDone':'Markeer als klaar','common.deleteLink':'Koppeling verwijderen','common.noMessagesYet':'Nog geen berichten.','common.writeShortMessagePlaceholder':'Schrijf een kort bericht…','common.stageWaiting':'Wachtend','common.stageStarted':'Gestart','common.stageDelayed':'Vertraagd','common.stageReadyNext':'Klaar voor volgend vak','common.stageComplete':'Voltooid','common.addStagesHint':'Voeg alleen fasen toe als je een werkvolgorde nodig hebt.','common.tradeOrStagePrompt':'Vak of fase','common.noCustomersMatchSearch':'Geen klanten komen overeen met je zoekopdracht.','common.noCustomersYet':'Nog geen klanten. Tik op "+ Nieuwe klant" om er een toe te voegen, of stuur een bouwplaatsklus vanaf je telefoon.','common.jobsCount':'{0} klus(sen)','common.openInMapsLink':'Openen in Maps ›','common.openPinnedLocationMaps':'📍 Vastgezette locatie openen in Maps ›','common.dragToTradeDbTitle':'Sleep naar je vakdatabase, het bureaublad of een andere app om een kopie van deze klus op te slaan','common.roomFallback':'Kamer','common.openArrowBtn':'Openen ›','common.noJobsYetCustomer':'Nog geen klussen voor deze klant.','common.siblingRoomTag':'🔗 Kamer {0} van {1} van hetzelfde bezoek aan de bouwplaats — geen duplicaat','common.customerNotNamed':'Klant niet benoemd','common.newSiteJob':'Nieuwe bouwplaatsklus','common.roomNotNamed':'Kamer niet benoemd','common.newBadge':'NIEUW','common.noNewJobsBadge':'Geen nieuwe klussen','common.noNewSiteJobsList':'Geen nieuwe bouwplaatsklussen','common.jobCouldNotBeRead':'⚠ Klus kon niet worden gelezen','common.jobDataCorrupted':'De gegevens van deze klus zijn beschadigd. Verwijder deze zodat nieuwe klussen niet worden geblokkeerd.','common.remove':'Verwijderen','common.removeWithoutOpening':'Verwijderen zonder te openen','common.saveToCustomer':'📁 Opslaan bij klant','common.openDrawingArrow':'Tekening openen ›','common.useBackupFile':'Back-upbestand gebruiken','common.directSyncUnavailableUseBackup':'Directe synchronisatie niet beschikbaar. Gebruik het back-upbestand.','common.couldNotAddDrawing':'Kon tekening niet toevoegen','common.roomsArea':'Kamergebied','common.selectedFileCouldNotBeRead':'Het geselecteerde bestand kon niet worden gelezen.','common.openingFileCancelled':'Het openen van het bestand is geannuleerd.','common.openingFileEllipsis':'Openen van ','common.photoOrScreenshotFallback':'foto of screenshot','common.fileWasEmpty':'Het bestand was leeg.','common.tryAnotherPictureScreenshot':'Probeer een andere afbeelding of screenshot.','common.checkingClipboardForDrawing':'Klembord controleren op een tekening…','common.drawingPastedFromClipboard':'Tekening geplakt vanuit klembord.','common.copyDrawingThenPasteHint':'Kopieer de tekening en druk dan op Ctrl + V. Het tekenvak is klaar.','common.installerNotesHeading':'Monteursnotities','common.accessOrderPlaceholder':'Toegang, werkvolgorde, stopcontacten, plinten of andere instructies','common.inThisRoomHeading':'In deze kamer','common.panelsTapToRemove':'panelen · tik om te verwijderen','common.noWardrobeCabinetYet':'Nog geen kast hier.','common.addWardrobeCabinetHeading':'Kast toevoegen','common.panelsWord':'panelen','common.noUnassignedUnits':'Geen niet-toegewezen units. Voeg eerst een kast toe of open een andere kamer.','common.renameRoomBtn':'Kamer hernoemen','common.deleteRoomBtn':'Kamer verwijderen','common.roomNamePrompt':'Kamernaam:','common.wardrobeOrCabinetCount':'{0} kast(en)','common.placeUnitsBtn':'Plaats {0} unit(s)','common.tapRoomAddUnit':'Tik op een kamer en voeg dan de unit toe','common.noRoomSelectedYet':'Nog geen kamer geselecteerd. Tik op Kies kamer en tik op een afbeelding.','roomType.kitchen':'Keuken','roomType.livingRoom':'Woonkamer','roomType.tvWall':'TV-wand','roomType.masterBedroom':'Hoofdslaapkamer','roomType.bedroom':'Slaapkamer','roomType.kidsBedroom':'Kinderkamer','roomType.dressingRoom':'Kleedkamer','roomType.bathroom':'Badkamer','roomType.office':'Kantoor','roomType.laundry':'Wasruimte','roomType.utilityRoom':'Bijkeuken','roomType.hallway':'Gang','roomType.underStairs':'Onder de trap','roomType.wineRoom':'Wijnkelder','roomType.library':'Bibliotheek','roomType.custom':'Aangepast','common.chooseRoomHeading':'Kies kamer','common.tapPictureRoomHelp':'Tik op de afbeelding van de kamer waaraan je werkt. Je kunt hetzelfde kamertype meer dan één keer toevoegen.','common.typeRoomNamePlaceholder':'Typ de kamernaam','common.addRoomBtn':'Kamer toevoegen','common.editJobHeading':'Klus bewerken','common.jobNameLabel':'Klusnaam','common.customerLabel':'Klant','common.cancelBtn':'Annuleren','common.saveBtn':'Opslaan','common.createOrOpenJobNote':'Maak een nieuwe klus of open een opgeslagen klus.','common.untitledJob':'Naamloze klus','common.addCustomer':'Klant toevoegen','common.editBtn':'Bewerken','common.chooseRoomBtn':'Kies kamer','common.continueToDrawing':'➡ Doorgaan naar tekening','common.openDrawingBtn':'Tekening openen','common.roomsWord':'kamers','common.unitsWord':'units','common.materialsWord':'materialen','common.piecesWord':'stuks','common.oneUnit':'1 unit','common.unitsCount':'{0} units','common.piecesCount':'{0} stuks','common.selectedRoomPrefix':'Geselecteerde kamer · ','common.noCustomerName':'Geen klantnaam','common.everythingReady':'Alles klaar','common.checkRedCardsBeforeSending':'Controleer de rode kaarten voordat je verstuurt','common.qrPanelsTitle':'QR-panelen','common.projectNotesTitle':'Projectnotities','common.roomsHeading':'Kamers','common.noRoomsYet':'Nog geen kamers.','common.panelsNeedMoreInfo':'⚠ {0} paneel/panelen heeft/hebben meer informatie nodig voor de zaaglijst.','common.noPanelsYetReturnDrawing':'Nog geen panelen. Ga terug naar Tekening en markeer het eerste paneel.','common.panelsReadyCount':'{0} van {1} panelen klaar','common.longShortEdges':'{0} lange kant(en) · {1} korte kant(en)','common.measurementsLabel':'Afmetingen:','common.panelCheckedLabel':'Paneel gecontroleerd','common.panelNotCheckedLabel':'Paneel niet gecontroleerd','common.doubleClickApprovePanel':'Dubbelklik om dit paneel goed te keuren','common.doubleClickAfterChecking':'Dubbelklik nadat je dit paneel hebt gecontroleerd','common.buildChecklistHeading':'Bouwchecklist','common.hardwareChecklistHeading':'Hardware-checklist','common.tickedOffCount':'{0} van {1} afgevinkt','common.autoPickedUpHint':'Elk paneel dat je op de tekening benoemt, wordt hier automatisch opgehaald — geen intypen nodig.','common.addOwnElectricalPlaceholder':'Voeg je eigen item toe, bijv. Elektrisch toegangspaneel','common.addOwnSoftClosePlaceholder':'Voeg je eigen item toe, bijv. Softclose-dempers','common.addBtnPlus':'+ Toevoegen','common.useSavedTemplateHeading':'Een opgeslagen sjabloon gebruiken?','common.startFromPreviousHint':'Begin deze kast met een eerdere panelenlijst, of begin leeg.','common.panelsHardwareCount':'{0} paneel/panelen · {1} hardware-item(s)','common.startBlankBtn':'Leeg beginnen','common.saveAsTemplateHeading':'Opslaan als sjabloon','common.templateNameLabel':'Sjabloonnaam','common.templateNamePlaceholder':'bijv. Kast met twee deuren','common.saveTemplateBtn':'Sjabloon opslaan','common.edgingConfirmationNeeded':'Kantenband en alle details moeten worden bevestigd','common.editPanelBtn':'Paneel bewerken','hardware.hinges':'Scharnieren','hardware.handles':'Handgrepen','hardware.shelfPins':'Plankdragers','hardware.ledLights':'LED-verlichting','hardware.ledDriverTransformer':'LED-driver/transformator','hardware.screwsFixings':'Schroeven & bevestigingsmateriaal','common.addedOnDrawing':'Toegevoegd op tekening','common.panelSavedToast':'Paneel opgeslagen','common.panelSavedNextReady':'Paneel opgeslagen · Volgend paneel klaar','common.panelCouldNotBeSaved':'Paneel kon niet worden opgeslagen','common.addMainInfoHint':'Voeg de belangrijkste informatie toe die de monteur moet onthouden.','common.accessOrderSpecialPlaceholder':'Toegang, werkvolgorde, speciale instructies, verlichting of iets anders belangrijks','common.saveNotesBtn':'✓ Notities opslaan','common.noWardrobeSelected':'Geen kast geselecteerd.','common.noCompletePartsReadySupplier':'Geen complete onderdelen zijn klaar voor de leverancier. Voeg eerst naam, dikte, lengte en breedte toe.','common.partTypeCount':'{0} onderdeeltype(n)','common.partNoHeader':'Onderdeelnr.','common.panelDetailsHeader':'Paneeldetails','common.descWhereGoesHeader':'Beschrijving / waar het komt','common.noProjectSelected':'Geen project geselecteerd.','common.noImageDrawingAvailable':'Geen afbeeldingstekening beschikbaar.','common.partHeader':'Onderdeel','common.descriptionHeader':'Beschrijving','common.statusHeaderPlain':'Status','common.panelNotFound':'Paneel niet gevonden','common.drawingMissingFor':'Tekening ontbreekt voor {0}','common.openedOnDrawing':'{0} geopend op de gemarkeerde tekening','common.allowPopupsPrintQr':'Sta pop-ups toe om QR-labels af te drukken','common.qrCodesGenerated':'QR-codes gegenereerd','nav.home':'Start','nav.customers':'Klanten','nav.qrAndScan':'QR en scan','nav.finishJob':'Klus afronden','nav.settings':'Instellingen','drawing.saveToCustomer':'Opslaan bij klant','jobs.newJobCustomerPrompt':'Klantnaam voor deze klus?','drawing.enterCustomerNamePrompt':'Voor welke klant is deze klus?','common.savedToCustomerToast':'Opgeslagen bij {0}'
 },
 pl:{start:'Rozpocznij projekt',startHelp:'Wpisz zlecenie i wybierz, co budujesz. Pomieszczenia pozostają w projekcie i są wysyłane na telefon.',job:'Nad czym pracujesz?',summary:'Zakończ zlecenie',summaryHelp:'Ostatnia kontrola wzrokowa, a następnie zapisz lub wyślij notatkę do ekipy montażowej.',finish:'Wyślij na telefon lub iPad',noteLabel:'Notatka na telefon',noteHint:'Wysyłana osobno, niezależnie od listy cięcia — przydatna do szybkiej wiadomości o tym zleceniu, na dowolnym etapie.',notePlaceholder:'Przykład: Szafa Reda — klient chce zawiasy z cichym domykiem, potwierdzić przed montażem.',noteSendBtn:'Wyślij notatkę na telefon',noteSendSmall:'Tylko ta notatka, lista cięcia niepotrzebna',
  'bom.pcsShort':'szt','bomScreen.deleteJob':'Usuń to zlecenie','bomScreen.saveProject':'Zapisz projekt','bomScreen.saveProjectSub':'Zachowaj wszystkie zmiany ze Studio','bomScreen.templateCheck':'Kontrola szablonu i okuć','bomScreen.templateCheckSub':'Sprawdź ponownie panele, zawiasy, oświetlenie, prowadnice, szuflady i okucia przed wysłaniem.',
  'customers.addCustomer':'💾 Dodaj klienta','customers.address':'Adres','customers.backToCustomers':'← Klienci','customers.cancel':'Anuluj','customers.delete':'🗑 Usuń','customers.edit':'✏️ Edytuj','customers.heading':'Klienci','customers.name':'Imię i nazwisko','customers.newCustomer':'+ Nowy klient','customers.phone':'Telefon','customers.save':'💾 Zapisz','customers.searchPlaceholder':'Szukaj klientów...','customers.subtitle':'Każde zlecenie, zapisane i uporządkowane według klienta.',
  'drawing.back':'Wstecz','drawing.catDoors':'Drzwi i szuflady','drawing.catInfills':'Wypełnienia','drawing.catKitchen':'Meble kuchenne','drawing.catTv':'Ściany i meble TV','drawing.catUtility':'Pomieszczenia gospodarcze i elementy specjalne','drawing.catWardrobes':'Szafy i szafki','drawing.checkAllPanels':'✓ Sprawdź wszystkie panele','drawing.chooseDrawing':'Wybierz rysunek','drawing.chosenParts':'Wybrane elementy','drawing.delete':'Usuń','drawing.dropHere':'Upuść rysunek, zrzut ekranu lub zdjęcie tutaj','drawing.dropHereHint':'Użyj przycisków powyżej, przeciągnij rysunek do tego pola, lub naciśnij Ctrl + V po skopiowaniu zrzutu ekranu.','drawing.dropHereSub':'Wklej, upuść, wybierz plik lub zrób zdjęcie.','drawing.edgeBandingTitle':'Kliknij dwukrotnie, aby dodać obrzeże','drawing.edgeHelp':'Kliknij dwukrotnie liczbę długości lub szerokości, aby dodać obrzeże: brak linii → jedna linia → podwójna linia.','drawing.fit':'Dopasuj','drawing.fitDrawing':'Dopasuj rysunek','drawing.leftRight':'Lewo / Prawo','drawing.length':'Długość','drawing.makeUnique':'Uczyń wybrany znacznik unikalnym','drawing.materialChooseOnce':'Materiał — wybierz raz dla tego zlecenia','drawing.materialHint':'Wpisz dokładną nazwę materiału użytego w tym zleceniu.','drawing.materialPrefix':'Materiał','drawing.morePartNames':'Więcej nazw elementów','drawing.noDrawing':'Brak rysunku','drawing.noPanelSelected':'Nie wybrano panelu','drawing.notesHint':'Dodaj lub użyj innej notatki','drawing.notesOptional':'Notatki — opcjonalnie','drawing.notesPrefix':'Notatki','drawing.panelOptions':'Opcje panelu','drawing.partName':'Nazwa elementu','drawing.partNamePlaceholder':'Wybierz lub wpisz nazwę elementu…','drawing.partSelected':'Wybrano element','drawing.pasteDrawing':'Wklej rysunek','drawing.pasteTitle':'Wklej skopiowany zrzut ekranu lub obraz','drawing.putSameNumber':'+ Umieść ten sam numer na rysunku','drawing.quantity':'Ilość','drawing.samePanelMarkers':'Te same znaczniki panelu:','drawing.saveMaterial':'Zapisz materiał','drawing.saveNext':'Zapisz i dalej','drawing.thickness':'Grubość','drawing.topBottom':'Góra / Dół','drawing.width':'Szerokość','drawing.zoomIn':'Powiększ','drawing.zoomOut':'Pomniejsz',
  'home.addLabel':'Dodaj','home.addUnitBelow':'Dodaj odpowiednią jednostkę poniżej.','home.addWardrobe':'+ Dodaj szafę lub szafkę','home.back':'← Wstecz','home.back2':'Wstecz','home.backHome':'← Start','home.chooseRoomHeading':'Wybierz pomieszczenie','home.chooseRoomHint':'Dotknij dużego przycisku ze zdjęciem. Pomieszczenie pozostaje w tym projekcie i jest automatycznie wysyłane na telefon.','home.chooseRoomHint2':'Wybierz pomieszczenie powyżej, a następnie dodaj odpowiedni mebel dla tego pomieszczenia.','home.continueJob':'Kontynuuj bieżące zlecenie','home.currentJobFallback':'Bieżące zlecenie','home.customerLabel':'Klient','home.customerPlaceholder':'Nazwa klienta','home.customersJobs':'Klienci i zlecenia','home.customersJobsSub':'Zobacz wszystkich klientów i ich projekty','home.jobNameHint':'Nazwij zlecenie raz, a następnie wybierz pomieszczenie, w którym pracujesz.','home.jobNameLabel':'Nazwa zlecenia','home.jobNamePlaceholder':'np. Dom Simone','home.newProject':'Nowy projekt','home.newProjectSub':'Rozpocznij nowego klienta lub projekt','home.openJobHint':'Otwórz zlecenie, nad którym pracujesz','home.recentJobs':'Ostatnie zlecenia','home.recentJobsSub':'Twoje ostatnio otwarte zlecenia','home.saveTemplateLater':'＋ Zapisz nowy szablon później','home.selectedRoomPrefix':'Wybrane pomieszczenie:','home.siteJobs':'Zlecenia na budowie','home.siteJobsNew':'Nowe zlecenia wysłane z telefonu','home.siteJobsSub':'Zdjęcia i pomiary z telefonu','home.templateFourDoor':'Szafa z czterema drzwiami','home.templateReady':'Gotowe do zapisanej listy kontrolnej','home.templateThreeSliding':'Szafa z trzema drzwiami przesuwnymi','home.templatesHeading':'🗂️ Moje szablony','home.templatesSub':'Twoja spersonalizowana biblioteka pojawi się tutaj.','home.unitCabinet':'szafka','home.unitKitchen':'element kuchenny','home.unitLivingRoom':'element do salonu','home.unitOffice':'element biurowy','home.unitTvWall':'ściana TV','home.unitUnderStairs':'element pod schodami','home.unitWardrobeOrCabinet':'szafa lub szafka','home.viewAll':'Zobacz wszystko','home.welcomeSubtitle':'Planuj, projektuj i zarządzaj swoimi projektami z łatwością.','home.welcomeTitle':'Witamy w AssembleOne Studio 👋','home.whatBuilding':'Co budujesz?',
  'parts.heading':'Kontrola paneli','parts.subtitle':'Sprawdź każdy panel przed utworzeniem listy cięcia.',
  'phoneScreen.heading':'Przewodnik po pomieszczeniach','phoneScreen.part':'Element','phoneScreen.subtitle':'Wybrany panel jest podświetlony.',
  'qrScreen.generate':'Generuj kody QR','qrScreen.heading':'Etykiety QR — tylko wybrana szafa','qrScreen.print':'Drukuj etykiety QR','qrScreen.smartQr':'Inteligentny QR:','qrScreen.smartQrBody':'Skanuj wewnątrz AssembleOne, aby otworzyć dokładnie podświetlony panel. Gdy aplikacja mobilna ma publiczny adres internetowy, wklej go poniżej, a zwykły aparat telefonu również będzie mógł otworzyć panel bezpośrednio.','qrScreen.subtitle':'Kody QR z innych zleceń i szaf są przechowywane osobno.','qrScreen.webAddress':'Adres internetowy aplikacji mobilnej','qrScreen.webAddressHint':'Zostaw to puste podczas lokalnego testowania. Następnie skanuj skanerem wewnątrz AssembleOne Mobile. Opublikowany projekt musi być już otwarty na telefonie lub iPadzie.',
  'settingsScreen.appData':'Dane aplikacji','settingsScreen.appDataHint':'Usuń wszystkie zlecenia, rysunki i ustawienia zapisane na tym urządzeniu. Tej czynności nie można cofnąć.','settingsScreen.clearData':'Wyczyść wszystkie dane na tym urządzeniu','settingsScreen.cloudSync':'Synchronizacja w chmurze','settingsScreen.cloudSyncHint':'To urządzenie synchronizuje się automatycznie z aplikacją telefoniczną przez chmurę. Logowanie nie jest wymagane.','settingsScreen.heading':'Ustawienia','settingsScreen.language':'Język','settingsScreen.languageHint':'Użyj menu flag u góry ekranu, aby zmienić język aplikacji.','settingsScreen.subtitle':'Preferencje aplikacji i synchronizacja.','settingsScreen.unitCm':'Centymetry (cm)','settingsScreen.unitIn':'Cale (in)','settingsScreen.unitMm':'Milimetry (mm)','settingsScreen.units':'Jednostki miary','settingsScreen.unitsHint':'Wybierz, jak wymiary paneli są wyświetlane i wpisywane na ekranie Rysowania.',
  sitePlanner:'Planer budowy','siteScreen.addFloorPlan':'Dodaj plan lub zdjęcie budowy. Następnie wybierz fach powyżej i dotknij planu.','siteScreen.addMeasurement':'↔ Pomiar','siteScreen.addPlan':'Dodaj / zmień plan budowy','siteScreen.addWorkStage':'+ Etap pracy','siteScreen.chooseTrade':'Wybierz fach, a następnie dotknij dokładnego miejsca na planie','siteScreen.chooseTradeMessage':'Wybierz fach i wyślij wiadomość projektową.','siteScreen.pinHint':'Pinezka staje się małą rozmową dla wszystkich pracujących w tym miejscu.','siteScreen.selectedPin':'Wybrana pinezka','siteScreen.showTrades':'Pokaż fachy','siteScreen.subtitle':'Umieszczaj pracę, notatki i rozmowy bezpośrednio na planie lub zdjęciu budowy.','siteScreen.tapPin':'Dotknij pinezki na planie.','siteScreen.tapPinHint':'Dotknij pinezki, aby przeczytać lub odpowiedzieć. Dotknij pustego miejsca po wybraniu fachu, aby dodać nową pinezkę.','siteScreen.tradeMessages':'Wiadomości według fachu','siteScreen.workOrder':'Kolejność prac',
  "partname.Adjustable shelf":"Półka regulowana","partname.Appliance panel":"Panel AGD","partname.Back panel":"Panel tylny","partname.Base bottom":"Dół szafki dolnej","partname.Base shelf":"Półka szafki dolnej","partname.Base side":"Bok szafki dolnej","partname.Base top":"Góra szafki dolnej","partname.Batten":"Łata drewniana","partname.Bench top":"Blat ławy","partname.Book shelf":"Półka na książki","partname.Bottom":"Dół","partname.Bottom infill":"Wypełnienie dolne","partname.Bracket":"Wspornik","partname.Cable panel":"Panel kablowy","partname.Centre divider":"Przegroda centralna","partname.Cleat":"Listwa","partname.Clip":"Klips","partname.Cover panel":"Panel maskujący","partname.Custom panel":"Panel niestandardowy","partname.Desk side":"Bok biurka","partname.Desk top":"Blat biurka","partname.Dishwasher panel":"Panel zmywarki","partname.Divider":"Przegroda","partname.Door":"Drzwi","partname.Drawer back":"Tył szuflady","partname.Drawer bottom":"Dno szuflady","partname.Drawer divider":"Przegroda szuflady","partname.Drawer front":"Front szuflady","partname.Drawer side":"Bok szuflady","partname.Drawer support":"Wspornik szuflady","partname.Dryer shelf":"Półka pod suszarkę","partname.End panel":"Panel boczny końcowy","partname.Filler panel":"Panel wypełniający","partname.Fireplace panel":"Panel kominkowy","partname.Fixed shelf":"Półka stała","partname.Fridge panel":"Panel lodówki","partname.Glass shelf":"Półka szklana","partname.Handle":"Uchwyt","partname.Hanging rail":"Drążek","partname.Hob rail":"Listwa płyty grzewczej","partname.Infill":"Wypełnienie","partname.Kickboard":"Cokół","partname.LED profile":"Profil LED","partname.Left door":"Drzwi lewe","partname.Left infill":"Wypełnienie lewe","partname.Left-hand side":"Lewy bok","partname.Light panel":"Panel świetlny","partname.Mirror panel":"Panel lustrzany","partname.Modesty panel":"Panel osłonowy","partname.Oven rail":"Listwa piekarnika","partname.Pair of doors":"Para drzwi","partname.Plinth":"Cokół","partname.Pocket door":"Drzwi chowane","partname.Printer shelf":"Półka pod drukarkę","partname.Right door":"Drzwi prawe","partname.Right infill":"Wypełnienie prawe","partname.Right-hand side":"Prawy bok","partname.Scribe panel":"Panel dopasowujący","partname.Seat top":"Blat siedziska","partname.Shelf":"Półka","partname.Side":"Bok","partname.Side panel":"Panel boczny","partname.Sink rail":"Listwa zlewozmywakowa","partname.Slatted panel":"Panel lamelowy","partname.Sliding door":"Drzwi przesuwne","partname.Speaker shelf":"Półka pod głośnik","partname.Splashback":"Panel przyścienny","partname.Support":"Podpora","partname.TV divider":"Przegroda TV","partname.TV panel":"Panel TV","partname.TV shelf":"Półka TV","partname.TV side":"Bok TV","partname.TV top":"Góra TV","partname.Tall cabinet side":"Bok szafki wysokiej","partname.Toe kick":"Listwa cokołowa","partname.Top":"Góra","partname.Top and bottom":"Góra i dół","partname.Top infill":"Wypełnienie górne","partname.Utility shelf":"Półka gospodarcza","partname.Wall cabinet bottom":"Dół szafki górnej","partname.Wall cabinet side":"Bok szafki górnej","partname.Wall cabinet top":"Góra szafki górnej","partname.Wall shelf":"Półka ścienna","partname.Washer shelf":"Półka pod pralkę","partname.Wine shelf":"Półka na wino","partname.Worktop":"Blat roboczy",
  'msg.noSitePicture':'Brak dostępnego zdjęcia z budowy.','msg.sitePhotoBesideDrawing':'Zdjęcie budowy znajduje się teraz obok narzędzi rysunkowych, jako odniesienie.','msg.confirmDeleteWardrobe':'Usunąć tę szafę i wszystkie jej elementy?','msg.openProjectFirst':'Najpierw otwórz projekt.','msg.confirmDeleteRoomUnassigned':'Usunąć pomieszczenie "{0}"? Szafy pozostaną nieprzypisane.','msg.jobSaved':'Zlecenie zapisane.','msg.projectNotFound':'Nie znaleziono projektu.','msg.enterCustomerName':'Wpisz nazwę klienta.','msg.customerAlreadyExists':'"{0}" już istnieje.','msg.confirmDeleteCustomer':'Usunąć "{0}"?\n\nTej czynności nie można cofnąć.','msg.confirmDeleteCustomerAndJobs':'Usunąć "{0}" i {1} zlecenie/zlecenia?\n\nTej czynności nie można cofnąć.','msg.siteUpdatesImported':'Zaimportowano aktualizacje z budowy. Status montażu, notatki i zdjęcia są teraz ponownie dostępne w Studio.','msg.notValidSiteUpdateZip':'To nie jest prawidłowy plik ZIP aktualizacji budowy AssembleOne.','msg.confirmDeleteWithoutSaving':'Usunąć "{0}" bez zapisywania go w żadnym miejscu?\n\nTej czynności nie można cofnąć.','msg.siteJobNoLongerWaiting':'To zlecenie budowy nie oczekuje już na realizację.','msg.savedToCustomerJobs':'Zapisano w zleceniach {0} — zawsze znajdziesz je w Moje projekty.','msg.couldNotSaveJobTryDrawing':'Nie można było zapisać tego zlecenia. Spróbuj zamiast tego Otwórz rysunek.','msg.noNewSiteJobsWaiting':'Brak nowych zleceń budowy oczekujących na realizację.','msg.dropZipToReopen':'Upuść plik .zip zlecenia AssembleOne, aby go ponownie otworzyć.','msg.siteJobOpenedDrawing':'Zlecenie budowy otwarte w Rysunku. Zdjęcie pomiarowe jest gotowe jako odniesienie.','msg.directSyncNotAvailableBackup':'Synchronizacja bezpośrednia nie jest tu dostępna. Użyj Otwórz plik zapasowy.','msg.projectOpenedInStudio':'Projekt otwarty w AssembleOne Studio.','msg.notValidProjectZip':'To nie jest prawidłowy plik ZIP projektu AssembleOne.','msg.choosePictureScreenshotPdf':'Wybierz obraz, zrzut ekranu lub plik PDF.','msg.drawingTooLargeStorage':'Rysunek wyświetla się poprawnie, ale jest zbyt duży do trwałego zapisania w pamięci przeglądarki. Trzymaj tę stronę otwartą podczas pracy lub użyj mniejszego zrzutu ekranu.','msg.drawingCouldNotOpen':'Nie udało się otworzyć rysunku.','msg.notPictureFileTryDragging':'Ten element nie jest plikiem obrazu. Spróbuj przeciągnąć plik PNG lub JPG z folderu Pobrane lub Obrazy.','msg.forMarkingPanelsUsePngJpg':'Aby oznaczać panele, użyj zrzutu PNG lub JPG pliku PDF.','msg.confirmDeletePanel':'Usunąć {0}?','msg.markOrSelectPanelFirst':'Najpierw oznacz lub wybierz panel.','msg.markPanelFirst':'Najpierw oznacz panel.','msg.choosePanelFirst':'Najpierw wybierz panel.','msg.allMarkersAlreadyOnDrawing':'Wszystkie {0} oznaczenia są już na rysunku.','msg.setQuantityFirst':'Najpierw ustaw Ilość powyżej 1, a następnie użyj tego, aby umieścić oznaczenie dla każdego elementu, po kolei.','msg.addedMoreMarkers':'Dodano {0} dodatkowe oznaczenie(a), więc wszystkie {1} są teraz na rysunku. Przeciągnij każde na jego rzeczywiste miejsce, a następnie zeskanuj własny kod QR po zamontowaniu.','msg.selectRepeatedMarkerFirst':'Najpierw wybierz jedno z powtórzonych oznaczeń.','msg.noCompletePartsReady':'Brak gotowych kompletnych elementów. Najpierw dodaj nazwę elementu, grubość, długość i szerokość.','msg.confirmRemovePin':'Usunąć tę pinezkę?','msg.confirmRemoveLinkedGroupChat':'Usunąć tę połączoną rozmowę grupową?','msg.finishAllSectionsFirst':'Najpierw ukończ Start, Rysunek, Panele, Listę cięcia i Etykiety QR. Każde pole zmieni kolor na zielony, gdy będzie gotowe.','msg.dropValidFileTypes':'Upuść tutaj plik PNG, JPG, WEBP lub PDF.','msg.printPreviewCouldNotOpen':'Nie udało się otworzyć podglądu wydruku. Spróbuj ponownie.','msg.noCompletePanelsToPrint':'Brak kompletnych paneli gotowych do wydruku.','msg.generateQrCodesFirst':'Najpierw wygeneruj kody QR.','msg.openJobFirst':'Najpierw otwórz zlecenie.','msg.nothingSentNoUnit':'Nic nie zostało wysłane, ponieważ to zlecenie nie ma jeszcze żadnej szafy.','msg.nothingSentNoPanels':'Nic nie zostało wysłane, ponieważ to zlecenie nie ma jeszcze paneli.','msg.confirmPanelsNotChecked':'{0} panel(e/i) nie zostały jeszcze sprawdzone (brakuje szczegółów lub nie zostały przejrzane). Wysłać mimo to?','msg.cuttingListSent':'Wysłano listę cięcia: {0} paneli i {1} elementów.','msg.siteJobSent':'Wysłano zlecenie budowy: {0} pomieszczenie, {1} szafa, {2} paneli i {3} elementów.','msg.phoneConnectionFailed':'Połączenie z telefonem nie powiodło się. Sprawdź, czy oba urządzenia mają dostęp do internetu, i spróbuj ponownie.','msg.typeNoteFirst':'Najpierw napisz notatkę.','msg.confirmClearAllData':'Spowoduje to usunięcie wszystkich zleceń, rysunków i ustawień zapisanych na tym urządzeniu. Tej czynności nie można cofnąć. Kontynuować?','msg.addPanelBeforeTemplate':'Dodaj co najmniej jeden panel przed zapisaniem szablonu.','msg.pleaseAddMissing':'Dodaj: {0}','msg.samePartNumberAdded':'Ten sam numer części został dodany ponownie. Przeciągnij nowe oznaczenie na odpowiedni panel.','msg.confirmDeleteJobBase':'Usunąć "{0}"?\n\nSpowoduje to trwałe usunięcie wszystkich szaf, rysunków, paneli, list cięcia, etykiet QR -- ORAZ wszelkich zdjęć lub pomiarów zapisanych dla tego zlecenia.','msg.confirmDeleteJobPhotos':'\n\nTo zlecenie ma {0} zapisane zdjęcie(a). Zostaną utracone, chyba że telefon nadal je ma i wyślesz je ponownie.','msg.confirmDeleteJobSibling':'\n\n⚠️ Wygląda na to, że to pomieszczenie {0} z {1} z tej samej wizyty na budowie ({2}) -- upewnij się, że to naprawdę to, które chcesz usunąć, a nie pomieszczenie pomylone z duplikatem.','home.tagline':'Pomieszczenia · Listy cięcia · Panele QR','status.ready':'Gotowe','status.installed':'Zainstalowane','status.missing':'Brakuje','status.damaged':'Uszkodzone','common.unnamedPart':'Nienazwana część','common.notSet':'Nie ustawiono','common.qty':'Ilość','common.noPanelsMarked':'Żadne panele nie zostały jeszcze oznaczone.','common.material':'Materiał:','common.edging':'Oklejanie:','common.notes':'Notatki:','common.status':'Status:','common.choosePartName':'Wybierz nazwę części','common.testQr':'Testuj QR','common.notTestedYet':'Jeszcze nie przetestowano','common.noPartsInWardrobe':'Brak części w tej szafie.','common.markerXOfY':'oznaczenie {0} z {1}','common.doubleClickTickOff':'kliknij dwukrotnie, aby odhaczyć','common.noCompleteComponentsYet':'Brak jeszcze kompletnych elementów. Najpierw uzupełnij nazwę i wszystkie wymiary.','step.start':'Start','step.drawing':'Rysunek','step.panels':'Panele','step.cuttingList':'Lista cięcia','step.qrLabels':'Etykiety QR','step.finish':'Zakończ','common.completeFirstFiveStages':'Ukończ pierwsze pięć etapów przed wysłaniem projektu','common.openThisSection':'Otwórz tę sekcję','common.sendCompletedProjectPhone':'Wyślij ukończony projekt na telefon lub iPada','common.completeAllFiveStepsFirst':'Najpierw ukończ wszystkie pięć poprzednich kroków','common.readyToSend':'Gotowe do wysłania','common.completeEveryStepFirst':'Najpierw ukończ wszystkie kroki','common.completeSuffix':' ukończone','common.notCompleteSuffix':' nieukończone','common.openStepPrefix':'Otwórz ','common.panelCheck':'Kontrola paneli','trade.builder':'Budowniczy','trade.bricklayer':'Murarz','trade.carpenter':'Cieśla','trade.electrician':'Elektryk','trade.plumber':'Hydraulik','trade.decorator':'Malarz','trade.flooring':'Podłogi','trade.wardrobes':'Szafy','trade.kitchenInstaller':'Monter kuchni','trade.tiler':'Glazurnik','trade.hvac':'Klimatyzacja','trade.heating':'Ogrzewanie','trade.windows':'Okna','trade.doors':'Drzwi','trade.roofer':'Dekarz','trade.steelworker':'Ślusarz','trade.landscaper':'Ogrodnik','trade.supplier':'Dostawca','trade.client':'Klient','trade.other':'Inne','trade.measurement':'Pomiar','common.move':'Przenieś','common.done':'Gotowe','common.delete':'Usuń','common.messagePrefix':'Wiadomość do ','common.tapPinOnPlan':'Dotknij pinezki na planie.','common.tradeLabel':'Fach','common.roomAreaLabel':'Pomieszczenie / strefa','common.bathroomExample':'Łazienka','common.statusLabel':'Status','common.pinStatusNew':'⚪ Nowy','common.pinStatusWaiting':'🟡 Oczekuje','common.pinStatusDone':'🟢 Gotowe','common.pinStatusProblem':'🔴 Problem','common.measurementTypeLabel':'Typ pomiaru','common.wallToWall':'Ściana do ściany','common.measurementMmLabel':'Pomiar (mm)','common.mainNoteLabel':'Główna notatka','common.whatNeedsDoingPlaceholder':'Co trzeba tu zrobić?','common.photoLabel':'Zdjęcie','common.savePinBtn':'Zapisz pinezkę','common.deletePinBtn':'Usuń pinezkę','common.conversationAtPin':'Rozmowa przy tej pinezce','common.noRepliesYet':'Brak odpowiedzi.','common.writeShortReplyPlaceholder':'Napisz krótką odpowiedź…','common.sendBtn':'Wyślij','common.dragTradePinToStart':'Przeciągnij pinezkę fachu na inną, aby rozpocząć czat grupowy.','common.reopen':'Otwórz ponownie','common.markDone':'Oznacz jako gotowe','common.deleteLink':'Usuń powiązanie','common.noMessagesYet':'Brak wiadomości.','common.writeShortMessagePlaceholder':'Napisz krótką wiadomość…','common.stageWaiting':'Oczekuje','common.stageStarted':'Rozpoczęte','common.stageDelayed':'Opóźnione','common.stageReadyNext':'Gotowe dla następnego fachu','common.stageComplete':'Ukończone','common.addStagesHint':'Dodawaj etapy tylko wtedy, gdy potrzebujesz kolejności prac.','common.tradeOrStagePrompt':'Fach lub etap','common.noCustomersMatchSearch':'Żaden klient nie pasuje do wyszukiwania.','common.noCustomersYet':'Brak jeszcze klientów. Dotknij "+ Nowy klient", aby dodać jednego, lub wyślij Zlecenie budowy z telefonu.','common.jobsCount':'{0} zlecenie/zlecenia','common.openInMapsLink':'Otwórz w Mapach ›','common.openPinnedLocationMaps':'📍 Otwórz przypiętą lokalizację w Mapach ›','common.dragToTradeDbTitle':'Przeciągnij do bazy danych fachów, na pulpit lub do innej aplikacji, aby zapisać kopię tego zlecenia','common.roomFallback':'Pomieszczenie','common.openArrowBtn':'Otwórz ›','common.noJobsYetCustomer':'Brak jeszcze zleceń dla tego klienta.','common.siblingRoomTag':'🔗 Pomieszczenie {0} z {1} z tej samej wizyty na budowie — nie duplikat','common.customerNotNamed':'Klient bez nazwy','common.newSiteJob':'Nowe zlecenie budowy','common.roomNotNamed':'Pomieszczenie bez nazwy','common.newBadge':'NOWE','common.noNewJobsBadge':'Brak nowych zleceń','common.noNewSiteJobsList':'Brak nowych zleceń budowy','common.jobCouldNotBeRead':'⚠ Nie udało się odczytać zlecenia','common.jobDataCorrupted':'Dane tego zlecenia są uszkodzone. Usuń je, aby nie blokowało nowych zleceń.','common.remove':'Usuń','common.removeWithoutOpening':'Usuń bez otwierania','common.saveToCustomer':'📁 Zapisz u klienta','common.openDrawingArrow':'Otwórz rysunek ›','common.useBackupFile':'Użyj pliku zapasowego','common.directSyncUnavailableUseBackup':'Synchronizacja bezpośrednia niedostępna. Użyj pliku zapasowego.','common.couldNotAddDrawing':'Nie udało się dodać rysunku','common.roomsArea':'Obszar pomieszczeń','common.selectedFileCouldNotBeRead':'Nie udało się odczytać wybranego pliku.','common.openingFileCancelled':'Otwieranie pliku zostało anulowane.','common.openingFileEllipsis':'Otwieranie ','common.photoOrScreenshotFallback':'zdjęcie lub zrzut ekranu','common.fileWasEmpty':'Plik był pusty.','common.tryAnotherPictureScreenshot':'Spróbuj innego obrazu lub zrzutu ekranu.','common.checkingClipboardForDrawing':'Sprawdzanie schowka w poszukiwaniu rysunku…','common.drawingPastedFromClipboard':'Rysunek wklejony ze schowka.','common.copyDrawingThenPasteHint':'Skopiuj rysunek, a następnie naciśnij Ctrl + V. Pole rysunku jest gotowe.','common.installerNotesHeading':'Notatki dla montera','common.accessOrderPlaceholder':'Dostęp, kolejność prac, gniazdka, listwy przypodłogowe lub inne instrukcje','common.inThisRoomHeading':'W tym pomieszczeniu','common.panelsTapToRemove':'paneli · dotknij, aby usunąć','common.noWardrobeCabinetYet':'Brak jeszcze szafy tutaj.','common.addWardrobeCabinetHeading':'Dodaj szafę','common.panelsWord':'paneli','common.noUnassignedUnits':'Brak nieprzypisanych jednostek. Najpierw dodaj szafę lub otwórz inne pomieszczenie.','common.renameRoomBtn':'Zmień nazwę pomieszczenia','common.deleteRoomBtn':'Usuń pomieszczenie','common.roomNamePrompt':'Nazwa pomieszczenia:','common.wardrobeOrCabinetCount':'{0} szafa/szafy','common.placeUnitsBtn':'Umieść {0} jednostkę/jednostki','common.tapRoomAddUnit':'Dotknij pomieszczenia, a następnie dodaj jednostkę','common.noRoomSelectedYet':'Nie wybrano jeszcze pomieszczenia. Dotknij Wybierz pomieszczenie i dotknij obrazu.','roomType.kitchen':'Kuchnia','roomType.livingRoom':'Salon','roomType.tvWall':'Ściana TV','roomType.masterBedroom':'Sypialnia główna','roomType.bedroom':'Sypialnia','roomType.kidsBedroom':'Pokój dziecięcy','roomType.dressingRoom':'Garderoba','roomType.bathroom':'Łazienka','roomType.office':'Biuro','roomType.laundry':'Pralnia','roomType.utilityRoom':'Pomieszczenie gospodarcze','roomType.hallway':'Korytarz','roomType.underStairs':'Pod schodami','roomType.wineRoom':'Piwniczka na wino','roomType.library':'Biblioteka','roomType.custom':'Niestandardowy','common.chooseRoomHeading':'Wybierz pomieszczenie','common.tapPictureRoomHelp':'Dotknij obrazu pomieszczenia, nad którym pracujesz. Możesz dodać ten sam typ pomieszczenia więcej niż raz.','common.typeRoomNamePlaceholder':'Wpisz nazwę pomieszczenia','common.addRoomBtn':'Dodaj pomieszczenie','common.editJobHeading':'Edytuj zlecenie','common.jobNameLabel':'Nazwa zlecenia','common.customerLabel':'Klient','common.cancelBtn':'Anuluj','common.saveBtn':'Zapisz','common.createOrOpenJobNote':'Utwórz nowe zlecenie lub otwórz zapisane.','common.untitledJob':'Zlecenie bez tytułu','common.addCustomer':'Dodaj klienta','common.editBtn':'Edytuj','common.chooseRoomBtn':'Wybierz pomieszczenie','common.continueToDrawing':'➡ Przejdź do rysunku','common.openDrawingBtn':'Otwórz rysunek','common.roomsWord':'pomieszczenia','common.unitsWord':'jednostki','common.materialsWord':'materiały','common.piecesWord':'sztuki','common.oneUnit':'1 jednostka','common.unitsCount':'{0} jednostki','common.piecesCount':'{0} sztuk','common.selectedRoomPrefix':'Wybrane pomieszczenie · ','common.noCustomerName':'Brak nazwy klienta','common.everythingReady':'Wszystko gotowe','common.checkRedCardsBeforeSending':'Sprawdź czerwone karty przed wysłaniem','common.qrPanelsTitle':'Panele QR','common.projectNotesTitle':'Notatki projektu','common.roomsHeading':'Pomieszczenia','common.noRoomsYet':'Brak jeszcze pomieszczeń.','common.panelsNeedMoreInfo':'⚠ {0} panel(e) wymaga(ją) więcej informacji przed listą cięcia.','common.noPanelsYetReturnDrawing':'Brak jeszcze paneli. Wróć do Rysunku i oznacz pierwszy panel.','common.panelsReadyCount':'{0} z {1} paneli gotowych','common.longShortEdges':'{0} długa/długie krawędź/krawędzie · {1} krótka/krótkie krawędź/krawędzie','common.measurementsLabel':'Wymiary:','common.panelCheckedLabel':'Panel sprawdzony','common.panelNotCheckedLabel':'Panel niesprawdzony','common.doubleClickApprovePanel':'Kliknij dwukrotnie, aby zatwierdzić ten panel','common.doubleClickAfterChecking':'Kliknij dwukrotnie po sprawdzeniu tego panelu','common.buildChecklistHeading':'Lista budowy','common.hardwareChecklistHeading':'Lista okuć','common.tickedOffCount':'{0} z {1} odhaczonych','common.autoPickedUpHint':'Każdy panel, który nazwiesz na rysunku, pojawia się tu automatycznie — nie trzeba go wpisywać.','common.addOwnElectricalPlaceholder':'Dodaj własny, np. Panel dostępu elektrycznego','common.addOwnSoftClosePlaceholder':'Dodaj własny, np. Amortyzatory soft-close','common.addBtnPlus':'+ Dodaj','common.useSavedTemplateHeading':'Użyć zapisanego szablonu?','common.startFromPreviousHint':'Rozpocznij tę szafę od poprzedniej listy paneli lub zacznij od zera.','common.panelsHardwareCount':'{0} panel(e) · {1} okucie/okucia','common.startBlankBtn':'Zacznij od zera','common.saveAsTemplateHeading':'Zapisz jako szablon','common.templateNameLabel':'Nazwa szablonu','common.templateNamePlaceholder':'np. Szafa dwudrzwiowa','common.saveTemplateBtn':'Zapisz szablon','common.edgingConfirmationNeeded':'Oklejanie i wszystkie szczegóły wymagają potwierdzenia','common.editPanelBtn':'Edytuj panel','hardware.hinges':'Zawiasy','hardware.handles':'Uchwyty','hardware.shelfPins':'Podpórki półek','hardware.ledLights':'Oświetlenie LED','hardware.ledDriverTransformer':'Zasilacz/transformator LED','hardware.screwsFixings':'Śruby i mocowania','common.addedOnDrawing':'Dodane na rysunku','common.panelSavedToast':'Panel zapisany','common.panelSavedNextReady':'Panel zapisany · Kolejny panel gotowy','common.panelCouldNotBeSaved':'Nie udało się zapisać panelu','common.addMainInfoHint':'Dodaj najważniejsze informacje, które monter powinien zapamiętać.','common.accessOrderSpecialPlaceholder':'Dostęp, kolejność prac, specjalne instrukcje, oświetlenie lub inne ważne informacje','common.saveNotesBtn':'✓ Zapisz notatki','common.noWardrobeSelected':'Nie wybrano szafy.','common.noCompletePartsReadySupplier':'Żadne kompletne części nie są gotowe dla dostawcy. Najpierw dodaj nazwę, grubość, długość i szerokość.','common.partTypeCount':'{0} typ(y) części','common.partNoHeader':'Nr części','common.panelDetailsHeader':'Szczegóły panelu','common.descWhereGoesHeader':'Opis / gdzie trafia','common.noProjectSelected':'Nie wybrano projektu.','common.noImageDrawingAvailable':'Brak dostępnego rysunku obrazkowego.','common.partHeader':'Część','common.descriptionHeader':'Opis','common.statusHeaderPlain':'Status','common.panelNotFound':'Nie znaleziono panelu','common.drawingMissingFor':'Brak rysunku dla {0}','common.openedOnDrawing':'{0} otwarty na wyróżnionym rysunku','common.allowPopupsPrintQr':'Zezwól na wyskakujące okienka, aby wydrukować etykiety QR','common.qrCodesGenerated':'Kody QR wygenerowane','nav.home':'Start','nav.customers':'Klienci','nav.qrAndScan':'QR i skan','nav.finishJob':'Zakończ zlecenie','nav.settings':'Ustawienia','drawing.saveToCustomer':'Zapisz u klienta','jobs.newJobCustomerPrompt':'Nazwa klienta dla tego zlecenia?','drawing.enterCustomerNamePrompt':'Dla którego klienta jest to zlecenie?','common.savedToCustomerToast':'Zapisano u {0}'
 }
};
function currentAppLang(){return localStorage.getItem('assembleone_language')||'en'}
function st(key,params){const T=APP_I18N[currentAppLang()]||APP_I18N.en;let s=(T&&T[key])||(APP_I18N.en&&APP_I18N.en[key])||key;if(params)params.forEach((v,i)=>{s=s.split('{'+i+'}').join(v)});return s}
function applyGenericI18n(){
 document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=st(el.dataset.i18n)});
 document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{el.placeholder=st(el.dataset.i18nPlaceholder)});
 document.querySelectorAll('[data-i18n-title]').forEach(el=>{el.title=st(el.dataset.i18nTitle)});
 document.querySelectorAll('[data-i18n-aria]').forEach(el=>{el.setAttribute('aria-label',st(el.dataset.i18nAria))});
}
function applyAppLanguage(lang){
 const t=APP_I18N[lang]||APP_I18N.en;
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
 set('startTitle',t.start);set('startHelp',t.startHelp);set('jobDetailsTitle',t.job);set('summaryTitle',t.summary);set('summaryHelp',t.summaryHelp);set('finishTitle',t.finish);
 set('noteLabel',t.noteLabel);set('noteHint',t.noteHint);set('noteSendBtn',t.noteSendBtn);set('noteSendSmall',t.noteSendSmall);
 const noteArea=document.getElementById('finishPhoneNote');if(noteArea&&t.notePlaceholder)noteArea.placeholder=t.notePlaceholder;
 document.documentElement.lang=lang;localStorage.setItem('assembleone_language',lang);
 applyGenericI18n();
 try{
  const nb=document.getElementById('newJobBtn');
  if(nb){const strong=nb.querySelector('strong');const small=nb.querySelector('small');if(strong)strong.textContent=st('home.newProject');if(small)small.textContent=st('home.newProjectSub')}
 }catch(e){}
 if(typeof renderAll==='function')try{renderAll()}catch(e){}
 if(typeof window.updateHome==='function')try{window.updateHome()}catch(e){}
 try{
  const p=typeof project==='function'?project():null;
  const homeText=document.getElementById('currentJobHomeText');
  if(homeText)homeText.textContent=p?(p.customer?`${p.customer} — ${p.name||st('home.currentJobFallback')}`:(p.name||st('home.currentJobFallback'))):st('home.openJobHint');
 }catch(e){}
}
window.st=st;window.currentAppLang=currentAppLang;window.applyGenericI18n=applyGenericI18n;

const STORE="buildSOS_v12";
const statuses=()=>[["ready",st('status.ready')],["installed",st('status.installed')],["missing",st('status.missing')],["damaged",st('status.damaged')]];
let state={projects:[],customers:[],currentProject:null,currentCabinet:null,currentPart:null,currentRoom:null,lastChosenPartName:"",numbering:false,screen:"jobs"};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const safe=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const project=()=>state.projects.find(x=>x.id===state.currentProject)||null;
const cabinet=()=>project()?.cabinets.find(x=>x.id===state.currentCabinet)||null;
const part=()=>cabinet()?.parts.find(x=>x.id===state.currentPart)||null;
const cabinetParts=()=>cabinet()?.parts||[];

function save(){
 try{
   localStorage.setItem(STORE,JSON.stringify(state));
   return true;
 }catch(err){
   console.warn("Project could not be fully stored in this browser.",err);
   return false;
 }
}
function load(){
 try{const s=JSON.parse(localStorage.getItem(STORE));if(s)state=s}catch(e){}
 if(!Array.isArray(state.customers))state.customers=[];
 const guide=parseGuideHash();
 if(guide&&Array.isArray(state.projects)&&state.projects.some(x=>x.id===guide.project)){state.currentProject=guide.project;state.currentCabinet=guide.cabinet;state.currentPart=guide.part;document.body.classList.add("guide-only");state.screen="phone"}
 else if(guide){location.hash=""}
 renderAll();updateWorkflowProgress(state.screen||"jobs")
}
function parseGuideHash(){
 const m=location.hash.match(/^#guide=([^:]+):([^:]+):(.+)$/);
 return m?{project:decodeURIComponent(m[1]),cabinet:decodeURIComponent(m[2]),part:decodeURIComponent(m[3])}:null
}
function updateWorkflowProgress(name){const order=["jobs","mark","parts","cutting","qr","bom"],current=Math.max(0,order.indexOf(name));$$("[data-step-screen]").forEach((el,i)=>{el.classList.toggle("current",i===current);el.classList.toggle("complete",i<current);const badge=el.querySelector(".workflow-status");if(badge)badge.textContent=i<current?"✓":String(i+1)})}
function show(name){if(name==="project"||name==="rooms")name="jobs";state.screen=name;$$(".screen").forEach(x=>x.classList.toggle("active",x.id===`screen-${name}`));$$(".nav-btn").forEach(x=>x.classList.toggle("active",x.dataset.screen===name));updateWorkflowProgress(name);save();if(typeof applyGenericI18n==='function')applyGenericI18n()}
function newJob(){
 const customer=(prompt(st('jobs.newJobCustomerPrompt'))||'').trim();
 const p={id:uid(),name:"New Job",customer,rooms:[],cabinets:[]};
 state.projects.unshift(p);state.currentProject=p.id;state.currentCabinet=null;state.currentPart=null;save();renderAll();show("jobs")
}
function selectedStudioRoom(){const p=ensureSharedProject(project());return p?.rooms.find(r=>r.id===state.currentRoom)||null}
function unitLabelForRoom(room){
 const type=(room?.type||room?.name||"").toLowerCase();
 if(type.includes("tv wall"))return st('home.unitTvWall');
 if(type.includes("kitchen"))return st('home.unitKitchen');
 if(type.includes("office"))return st('home.unitOffice');
 if(type.includes("laundry")||type.includes("utility"))return st('home.unitCabinet');
 if(type.includes("under stairs"))return st('home.unitUnderStairs');
 if(type.includes("living"))return st('home.unitLivingRoom');
 return st('home.unitWardrobeOrCabinet');
}
function updateUnitAddWording(){
 const room=selectedStudioRoom(),label=unitLabelForRoom(room),btn=$("#newCabinetBtn"),title=$("#unitSectionTitle"),help=$("#unitSectionHelp");
 if(btn)btn.textContent=room?`+ ${st('home.addLabel')} ${label}`:st('home.addWardrobe');
 if(title)title.textContent=room?`${room.icon||"⌂"} ${room.name}`:st('home.whatBuilding');
 if(help)help.textContent=room?`${st('home.selectedRoomPrefix')} ${room.name}. ${st('home.addUnitBelow')}`:st('home.chooseRoomHint2');
}
function addCabinet(){
 const p=project();if(!p)return;
 const room=selectedStudioRoom(),label=unitLabelForRoom(room),same=p.cabinets.filter(c=>room?c.roomId===room.id:true).length;
 const defaultName=label.charAt(0).toUpperCase()+label.slice(1)+(same?` ${same+1}`:"");
 const name=prompt(`${label.charAt(0).toUpperCase()+label.slice(1)} name:`,defaultName);if(name===null)return;
 const c={id:uid(),name:name||defaultName,roomId:room?.id||"",drawing:null,drawingType:null,parts:[]};
 p.cabinets.push(c);state.currentCabinet=c.id;state.currentPart=null;save();renderAll();show("mark")
}
function nextCode(c){return `P-${String(c.parts.length+1).padStart(3,"0")}`}
function createPartAt(x,y){
 const c=cabinet();if(!c)return;
 const rememberedThickness=Number(c.lastThickness ?? getDefaultThicknessMM()) || getDefaultThicknessMM();
 const inheritedMaterial=(project()?.defaultMaterial||c.lastMaterial||"").trim();
 const rememberedLength=c.lastLength!=null?c.lastLength:"";
 const rememberedWidth=c.lastWidth!=null?c.lastWidth:"";
 const p={id:uid(),code:nextCode(c),name:state.lastChosenPartName||"",length:rememberedLength,width:rememberedWidth,thickness:rememberedThickness,qty:1,material:inheritedMaterial,edgeLong:0,edgeShort:0,notes:"",status:"ready",x,y,copies:[]};
 c.parts.push(p);state.currentPart=p.id;save();renderAll();$("#fLength").focus();$("#fLength").select()
}
function renderHeader(){
 const p=project();
 const tag=document.getElementById("headerTag");
 if(!tag)return;
 if(p&&p.customer){
  const label=p.customer+(p.address?" · "+p.address:"");
  tag.textContent=label;
  tag.title=label;
 }else{
  tag.textContent=st('home.tagline');
  tag.title=st('home.tagline');
 }
}
function renderJobs(){
 const box=$("#jobGrid"),active=project();
 box.innerHTML=state.projects.length?state.projects.map(p=>{const siteRoom=(p.rooms||[]).find(r=>r.siteMarkup?.image||(r.sitePhotos||[]).length||(r.beforePhotos||[]).length);const siteReceived=!!siteRoom;const sib=siblingRoomInfo(p);const sibTag=sib?`<div class="sibling-room-tag" title="${safe(sib.names.join(', '))}">🔗 Room ${sib.index} of ${sib.total} from the same site visit — not a duplicate</div>`:'';return `<article class="folder-card ${p.id===state.currentProject?"selected-job":""} ${siteReceived?"site-received":""}" draggable="true" data-drag-job="${p.id}" title="Drag onto your desktop or another app to save a copy of this job -- drag that file back onto this screen to reopen it"><div class="folder-icon">${siteReceived?(siteRoom.icon||"📍"):"📁"}</div><h3>${safe(p.name)}</h3><div class="muted">${safe(p.customer||"No customer name")}<br>${(p.rooms||[]).length} room${(p.rooms||[]).length===1?"":"s"} · ${p.cabinets.length} unit${p.cabinets.length===1?"":"s"}</div>${siteReceived?'<div class="site-job-tag">✓ Site measurements received</div>':''}${sibTag}<div class="actions"><button class="btn primary" data-open-job="${p.id}">${p.id===state.currentProject?"Job open":"Open job"}</button>${siteReceived?`<button class="btn site-details-btn" data-site-details="${p.id}">Open details</button>`:''}<button class="btn trade-export-btn" data-export-trade="${p.id}">Export record</button><button class="btn danger" data-delete-job-card="${p.id}">Delete</button></div></article>`}).join(""):'<div class="empty">No jobs yet. Press “New job”.</div>';
 const workspace=$("#combinedProjectWorkspace");if(workspace)workspace.classList.toggle("is-empty",!active);
 $$("[data-open-job]").forEach(b=>b.onclick=()=>{state.currentProject=b.dataset.openJob;state.currentCabinet=project()?.cabinets[0]?.id||null;state.currentPart=null;renderAll();show("jobs")});
 $$("[data-site-details]").forEach(b=>b.onclick=()=>openSiteRoomDetails(b.dataset.siteDetails));
 $$('[data-export-trade]').forEach(b=>b.onclick=()=>exportProjectRecord(b.dataset.exportTrade));
 wireJobDragOut(box);
 $$("[data-delete-job-card]").forEach(b=>b.onclick=()=>{
   const p=state.projects.find(x=>x.id===b.dataset.deleteJobCard);
   if(!p)return;
   const ok=confirm(deleteJobConfirmMessage(p));
   if(!ok)return;
   state.projects=state.projects.filter(x=>x.id!==p.id);
   if(state.currentProject===p.id){state.currentProject=null;state.currentCabinet=null;state.currentPart=null}
   save();renderAll();show("jobs");
 });
}

// Returns {src,label,takenAt} for every picture a phone site visit produced,
// including notePhotos -- these were being silently dropped here, so a photo
// taken alongside a note never showed up anywhere in Studio at all. Kept as
// plain reference material (label + timestamp) rather than auto-picked as
// the cabinet drawing -- "Use in Drawing" below still requires an explicit
// tap on a specific photo, so nothing here can land in the drawing by itself.
function siteRoomPictures(room){
 const out=[];
 const add=(x,label)=>{
  if(!x)return;
  const src=typeof x==='string'?x:(x.data||x.src||x.url||x.image);
  if(!src||out.some(p=>p.src===src))return;
  const takenAt=(x&&typeof x==='object')?(x.takenAt||x.createdAt||null):null;
  out.push({src,label,takenAt});
 };
 add(room?.siteMarkup?.image,'Measurement sketch');
 (room?.measureCaptures||[]).forEach(c=>add(c.image,'Measurement photo'));
 (room?.sitePhotos||[]).forEach(x=>add(x,'Site photo'));
 (room?.beforePhotos||[]).forEach(x=>add(x,'Before photo'));
 (room?.designImages||[]).forEach(x=>add(x,'Design view'));
 (room?.notePhotos||[]).forEach(x=>add(x,'Note photo'));
 return out;
}
function siteRoomMeasureCount(room){return room?.siteMarkup?.marks?.filter(x=>x.type==='measure').length||room?.measurements?.length||0}
function siteRoomPictureCaption(pic){
 if(!pic)return'';
 const when=pic.takenAt?new Date(pic.takenAt):null;
 const stamp=when&&!isNaN(when)?when.toLocaleDateString([],{day:'2-digit',month:'short',year:'numeric'})+' · '+when.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'';
 return [pic.label,stamp].filter(Boolean).join(' · ');
}
function openSiteRoomDetails(projectId,roomId){
 const p=ensureSharedProject(state.projects.find(x=>x.id===projectId));if(!p)return;
 const room=p.rooms.find(r=>r.id===roomId)||p.rooms.find(r=>siteRoomPictures(r).length)||p.rooms[0]||{name:'Site room',icon:'📍'};
 const pics=siteRoomPictures(room),measures=siteRoomMeasureCount(room),floor=room.floor||room.location||'Not selected',notes=room.notes||room.siteNotes||p.notes||'';
 const overlay=document.getElementById('siteRoomDetailsModal');if(!overlay)return;overlay.dataset.projectId=p.id;overlay.dataset.roomId=room.id||'';overlay.dataset.pictureIndex='0';
 document.getElementById('siteRoomDetailsTitle').textContent=room.name||'Site room';document.getElementById('siteRoomDetailsIcon').textContent=room.icon||'📍';document.getElementById('siteRoomDetailsMeta').textContent=`${p.name||'Project'} · ${floor}`;
 const frame=document.getElementById('siteRoomReferenceFrame');frame.innerHTML=pics.length?`<img id="siteRoomMainImage" src="${pics[0].src}" alt="Site measurement photo">`:'<div class="site-reference-empty">No site picture received</div>';
 const caption=document.getElementById('siteRoomPictureCaption');if(caption)caption.textContent=siteRoomPictureCaption(pics[0]);
 const thumbs=document.getElementById('siteRoomThumbs');thumbs.innerHTML=pics.map((pic,i)=>`<img class="site-thumb ${i===0?'active':''}" data-site-thumb="${i}" src="${pic.src}" alt="${safe(pic.label)}" title="${safe(siteRoomPictureCaption(pic))}">`).join('');
 document.getElementById('siteRoomPhotoCount').textContent=pics.length;document.getElementById('siteRoomMeasureCount').textContent=measures;document.getElementById('siteRoomFloor').textContent=floor;document.getElementById('siteRoomNotes').textContent=notes||'No extra notes';
 thumbs.querySelectorAll('[data-site-thumb]').forEach(t=>t.onclick=()=>{overlay.dataset.pictureIndex=t.dataset.siteThumb;const pic=pics[+t.dataset.siteThumb];document.getElementById('siteRoomMainImage').src=pic.src;if(caption)caption.textContent=siteRoomPictureCaption(pic);thumbs.querySelectorAll('.site-thumb').forEach(x=>x.classList.toggle('active',x===t))});
 overlay.classList.add('open');overlay.setAttribute('aria-hidden','false')
}
function closeSiteRoomDetails(){const m=document.getElementById('siteRoomDetailsModal');m?.classList.remove('open');m?.setAttribute('aria-hidden','true')}
function sendSitePhotoToDrawing(){
 const m=document.getElementById('siteRoomDetailsModal'),p=ensureSharedProject(state.projects.find(x=>x.id===m?.dataset.projectId));if(!p)return;const room=p.rooms.find(r=>r.id===m.dataset.roomId)||p.rooms[0];const pics=siteRoomPictures(room);const pic=pics[+(m.dataset.pictureIndex||0)];if(!pic)return alert(st('msg.noSitePicture'));
 let c=p.cabinets.find(x=>x.roomId===room?.id);if(!c){c={id:uid(),name:(room?.name||'Site room')+' design',roomId:room?.id||'',drawing:null,drawingType:null,parts:[]};p.cabinets.push(c)}
 c.drawing=pic.src;c.drawingType='image';c.drawingName=(room?.name||'Site room')+' measurement photo';state.currentProject=p.id;state.currentCabinet=c.id;state.currentPart=null;renderAll();save();closeSiteRoomDetails();show('mark');alert(st('msg.sitePhotoBesideDrawing'))
}
function renderProject(){
 const p=project();$("#projectName").value=p?.name||"";$("#customerName").value=p?.customer||"";
 const box=$("#cabinetList");
 if(!p){box.innerHTML='<div class="empty">Choose a job first.</div>';return}
 box.innerHTML=p.cabinets.length?p.cabinets.map(c=>`<div class="cabinet-card"><div><strong>${safe(c.name)}</strong><div class="muted">${c.parts.length} parts ${c.drawing?"· drawing added":""}</div></div><div><button class="btn primary" data-open-cabinet="${c.id}">Open</button> <button class="btn danger" data-delete-cabinet="${c.id}">Delete</button></div></div>`).join(""):'<div class="empty">No wardrobes yet.</div>';
 $$("[data-open-cabinet]").forEach(b=>b.onclick=()=>{state.currentCabinet=b.dataset.openCabinet;state.currentPart=null;renderAll();show("mark")});
 $$("[data-delete-cabinet]").forEach(b=>b.onclick=()=>{if(confirm(st('msg.confirmDeleteWardrobe'))){p.cabinets=p.cabinets.filter(c=>c.id!==b.dataset.deleteCabinet);state.currentCabinet=p.cabinets[0]?.id||null;save();renderAll()}})
}
function renderCabinetSelect(){
 const p=project(),s=$("#cabinetSelect");s.innerHTML=p?.cabinets.length?p.cabinets.map(c=>`<option value="${c.id}">${safe(c.name)}</option>`).join(""):'<option>No wardrobe</option>';if(p?.cabinets.some(c=>c.id===state.currentCabinet))s.value=state.currentCabinet
}
function renderSiteMeasurementOverlay(canvas,c){
 canvas.querySelectorAll('.site-measure-overlay').forEach(x=>x.remove());const m=c?.siteMarkup;if(!m?.marks?.length||!m.w||!m.h)return;const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('class','site-measure-overlay');svg.setAttribute('viewBox',`0 0 ${m.w} ${m.h}`);svg.setAttribute('preserveAspectRatio','xMidYMid meet');
 (m.marks||[]).filter(x=>x.type==='measure').forEach(mark=>{const x1=+mark.x1||0,y1=+mark.y1||0,x2=+mark.x2||0,y2=+mark.y2||0,mx=(x1+x2)/2,my=(y1+y2)/2,label=String(mark.value||'').trim(),name=String(mark.name||mark.kind||'Measurement'),w=Math.max(130,label.length*18,name.length*10+28);const line=document.createElementNS(ns,'line');line.setAttribute('class','measure-line');['x1','y1','x2','y2'].forEach((a,i)=>line.setAttribute(a,[x1,y1,x2,y2][i]));svg.appendChild(line);[[x1,y1],[x2,y2]].forEach(([x,y])=>{const q=document.createElementNS(ns,'circle');q.setAttribute('class','measure-end');q.setAttribute('cx',x);q.setAttribute('cy',y);q.setAttribute('r',8);svg.appendChild(q)});const g=document.createElementNS(ns,'g');g.setAttribute('transform',`translate(${mx-w/2},${my-36})`);const rect=document.createElementNS(ns,'rect');rect.setAttribute('class','measure-box');rect.setAttribute('width',w);rect.setAttribute('height',70);rect.setAttribute('rx',11);g.appendChild(rect);const v=document.createElementNS(ns,'text');v.setAttribute('class','measure-value');v.setAttribute('x',w/2);v.setAttribute('y',30);v.setAttribute('text-anchor','middle');v.textContent=label?label+' '+(mark.unit||'mm'):'Measurement';g.appendChild(v);const n=document.createElementNS(ns,'text');n.setAttribute('class','measure-name');n.setAttribute('x',w/2);n.setAttribute('y',56);n.setAttribute('text-anchor','middle');n.textContent=name;g.appendChild(n);svg.appendChild(g)});canvas.appendChild(svg)
}
function renderRooms(){
 const c=cabinet(),stage=$("#drawingStage"),canvas=$("#drawingCanvas"),img=$("#drawingImage"),pdf=$("#drawingPdf"),empty=$("#drawingEmpty");
 if(c){c.viewState=c.viewState||{};if(c.viewState.zoom!=null)state.drawingZoom=c.viewState.zoom}
 const zoom=Math.max(.25,Math.min(4,Number(state.drawingZoom||1)));state.drawingZoom=zoom;if(c)c.viewState.zoom=zoom;$("#zoomValue").textContent=Math.round(zoom*100)+"%";
 function sizeCanvas(){const pad=28,availableW=Math.max(260,stage.clientWidth-pad),availableH=Math.max(320,stage.clientHeight-pad);if(c?.drawingType==="pdf"){canvas.style.width=Math.round(availableW*zoom)+"px";canvas.style.height=Math.round(availableH*zoom)+"px";return}const nw=img.naturalWidth||availableW,nh=img.naturalHeight||availableH,fit=Math.min(availableW/nw,availableH/nh,1);canvas.style.width=Math.max(180,Math.round(nw*fit*zoom))+"px";canvas.style.height=Math.max(180,Math.round(nh*fit*zoom))+"px"}
 sizeCanvas();
 canvas.querySelectorAll(".pin").forEach(x=>x.remove());img.style.display=pdf.style.display="none";empty.style.display="block";$("#drawingName").textContent=c?.drawingName||c?.name||st('drawing.noDrawing');
 if(!c?.drawing)return;empty.style.display="none";
 if(c.drawingType==="pdf"){pdf.src=c.drawing;pdf.style.display="block";sizeCanvas()}else{img.onload=()=>{sizeCanvas();renderSiteMeasurementOverlay(canvas,c)};img.src=c.drawing;img.style.display="block";if(img.complete){sizeCanvas();renderSiteMeasurementOverlay(canvas,c)}}
 c.parts.forEach(p=>{
   // Each repeated panel (see p.copies) is now its own trackable instance --
   // the primary mark's status still lives on p.status (unchanged), but
   // every copy carries its own status so the drawing can show which of
   // several identical panels are actually installed, not just the part
   // as a whole.
   const marks=[{x:p.x,y:p.y,index:-1,status:p.status},...(p.copies||[]).map((m,index)=>({...m,index,status:m.status||"ready"}))];
   const numbered=marks.length>1;
   marks.forEach((m,mi)=>{const d=document.createElement("div");const isSelected=p.id===state.currentPart&&Number(state.selectedCopy??-1)===m.index;d.className=`pin status-${m.status}${m.index>=0?" marker-copy":""}${isSelected?" selected":""}${numbered?" numbered":""}`;d.textContent=numbered?String(mi+1):(isSelected?p.code.replace("P-",""):"");d.title=`${p.code}${p.name?" — "+p.name:""}${numbered?" · "+st('common.markerXOfY',[mi+1,marks.length])+" · "+(statuses().find(s=>s[0]===m.status)?.[1]||m.status):""} · ${st('common.doubleClickTickOff')}`;d.setAttribute("aria-label",d.title);d.style.left=m.x+"%";d.style.top=m.y+"%";d.dataset.id=p.id;d.dataset.copy=m.index;d.onmousedown=e=>startDrag(e,p.id,m.index);d.onclick=e=>{e.stopPropagation();state.currentPart=p.id;state.selectedCopy=m.index;state.focusMarker=true;renderAll()};
     // Double-click a marker to tick it off directly on the drawing --
     // toggles ready<->installed without opening the status buttons, so
     // checking that all five (or however many) repeated panels are
     // present/fitted is one quick double-click per dot, not a detour
     // through the form for each one.
     d.ondblclick=e=>{e.stopPropagation();e.preventDefault();const target=m.index>=0?p.copies[m.index]:p;target.status=target.status==="installed"?"ready":"installed";state.currentPart=p.id;state.selectedCopy=m.index;save();renderAll()};
     canvas.appendChild(d)})
 })
 if(state.currentPart&&state.focusMarker){requestAnimationFrame(()=>{const selected=stage.querySelector('.pin.selected');if(selected){const left=selected.offsetLeft-stage.clientWidth/2;const top=selected.offsetTop-stage.clientHeight/2;stage.scrollTo({left:Math.max(0,left),top:Math.max(0,top),behavior:'smooth'})}state.focusMarker=false})}
 else if(c?.viewState){requestAnimationFrame(()=>stage.scrollTo({left:Number(c.viewState.scrollLeft||0),top:Number(c.viewState.scrollTop||0)}))}
 return;
}
let dragging=null;
function startDrag(e,id,copy=-1){e.stopPropagation();dragging={id,copy};document.body.style.userSelect="none"}
window.addEventListener("mousemove",e=>{if(!dragging)return;const p=cabinet()?.parts.find(x=>x.id===dragging.id),r=$("#drawingCanvas").getBoundingClientRect();if(!p)return;const x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100)),y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));if(dragging.copy>=0&&p.copies?.[dragging.copy]){p.copies[dragging.copy].x=x;p.copies[dragging.copy].y=y}else{p.x=x;p.y=y}renderRooms()});
window.addEventListener("mouseup",()=>{if(dragging){dragging=null;document.body.style.userSelect="";save()}});

const MATERIAL_LIBRARY_KEY="assembleone_material_library_v1";
function savedMaterials(){
 try{
   const arr=JSON.parse(localStorage.getItem(MATERIAL_LIBRARY_KEY)||"[]");
   return Array.isArray(arr)?arr.filter(Boolean):[];
 }catch(e){return []}
}
function storeMaterialName(name){
 name=String(name||"").trim();if(!name)return;
 const list=savedMaterials().filter(x=>x.toLowerCase()!==name.toLowerCase());
 list.unshift(name);
 localStorage.setItem(MATERIAL_LIBRARY_KEY,JSON.stringify(list.slice(0,60)));
}
function closeMaterialPicker(){
 const d=$("#materialPickerDetails");
 if(d)d.open=false;
}
function closeNotesPicker(){
 const d=$("#notesPickerDetails");
 if(d)d.open=false;
}
function chooseMaterial(name){
 name=String(name||"").trim();if(!name)return;
 const p=part(),pr=project(),c=cabinet();
 if(p)p.material=name;
 if(pr)pr.defaultMaterial=name;
 if(c)c.lastMaterial=name;
 storeMaterialName(name);
 const hidden=$("#fMaterial");if(hidden)hidden.value=name;
 const custom=$("#materialCustomInput");if(custom)custom.value="";
 save();
 renderMaterialPicker();
 closeMaterialPicker();
 const summary=$("#materialSummary");if(summary)summary.textContent=`${st('drawing.materialPrefix')} — ${name}`;
 // Keep the selector closed even after other render work finishes.
 requestAnimationFrame(()=>{renderMaterialPicker();closeMaterialPicker()});
 setTimeout(()=>{renderMaterialPicker();closeMaterialPicker()},40);
}

function renderMaterialPicker(){
 const p=part(),pr=project();
 const current=(p?.material||pr?.defaultMaterial||"").trim();
 const defaults=["White melamine","Grey melamine","Oak melamine","Walnut melamine","MDF","Plywood"];
 const names=[];
 [...savedMaterials(),...defaults].forEach(x=>{if(x&&!names.some(n=>n.toLowerCase()===x.toLowerCase()))names.push(x)});
 const summary=$("#materialSummary"),grid=$("#materialLibraryGrid"),hidden=$("#fMaterial");
 if(summary)summary.textContent=current?`${st('drawing.materialPrefix')} — ${current}`:st('drawing.materialChooseOnce');
 if(hidden)hidden.value=current;
 if(grid){
   grid.innerHTML=names.map(n=>`<button type="button" class="material-choice ${current.toLowerCase()===n.toLowerCase()?"active":""}" data-material-name="${safe(n)}">${safe(n)}</button>`).join("");
   grid.querySelectorAll("[data-material-name]").forEach(b=>b.onclick=()=>chooseMaterial(b.dataset.materialName));
 }
}

const NOTES_LIBRARY_KEY="assembleone_notes_library_v1";
function savedNotes(){
 try{
   const arr=JSON.parse(localStorage.getItem(NOTES_LIBRARY_KEY)||"[]");
   return Array.isArray(arr)?arr.filter(Boolean):[];
 }catch(e){return []}
}
function storeNoteName(name){
 name=String(name||"").trim();if(!name)return;
 const list=savedNotes().filter(x=>x.toLowerCase()!==name.toLowerCase());
 list.unshift(name);
 localStorage.setItem(NOTES_LIBRARY_KEY,JSON.stringify(list.slice(0,100)));
}
function splitPanelNotes(value){
 return String(value||"").split(/\s*[,;|]\s*/).map(x=>x.trim()).filter(Boolean);
}
function choosePanelNote(name){
 name=String(name||"").trim();if(!name)return;
 const p=part();if(!p)return;
 const notes=splitPanelNotes(p.notes);
 const i=notes.findIndex(x=>x.toLowerCase()===name.toLowerCase());
 if(i>=0)notes.splice(i,1);else notes.push(name);
 p.notes=notes.join(", ");
 storeNoteName(name);
 const hidden=$("#fNotes");if(hidden)hidden.value=p.notes;
 save();
 renderAll();
 // renderAll rebuilds the form, so close the Notes section after the rebuild.
 closeNotesPicker();
 requestAnimationFrame(()=>closeNotesPicker());
 setTimeout(()=>closeNotesPicker(),40);
}
function renderNotesPicker(){
 const p=part();
 const current=splitPanelNotes(p?.notes||"");
 const defaults=[
  "LED","Warm LED","LED channel","Door sensor","Motion sensor","Cable hole","Socket cut-out",
  "Soft-close hinges","Push to open","Left opening","Right opening","Handle position","Drawer runners",
  "Adjustable shelf","Fixed shelf","Wall fixing","Scribe to wall","Infill panel","Edge banding",
  "Sink cut-out","Tap hole","Plumbing access","Dishwasher","Oven","Hob","Extractor","Fridge ventilation",
  "Washer","Dryer","Ventilation gap","Check on site","Mirror","Glass shelf"
 ];
 const names=[];
 [...savedNotes(),...defaults].forEach(x=>{if(x&&!names.some(n=>n.toLowerCase()===x.toLowerCase()))names.push(x)});
 const summary=$("#notesSummary"),grid=$("#notesLibraryGrid"),hidden=$("#fNotes");
 if(summary)summary.textContent=current.length?`${st('drawing.notesPrefix')} — ${current.join(" · ")}`:st('drawing.notesOptional');
 if(hidden)hidden.value=p?.notes||"";
 if(grid){
   grid.innerHTML=names.map(n=>`<button type="button" class="note-choice ${current.some(x=>x.toLowerCase()===n.toLowerCase())?"active":""}" data-note-name="${safe(n)}">${safe(n)}</button>`).join("");
   grid.querySelectorAll("[data-note-name]").forEach(b=>b.onclick=()=>choosePanelNote(b.dataset.noteName));
 }
}
function renderForm(){
 const p=part();const banner=$("#selectedPartBanner");
 const markLabel=p&&(1+(p.copies?.length||0))>1?" · "+st('common.markerXOfY',[Number(state.selectedCopy)>=0?Number(state.selectedCopy)+2:1,1+(p.copies?.length||0)]):"";
 banner.textContent=p?`${p.code} — ${p.name||st('drawing.partSelected')}${markLabel}`:st('drawing.noPanelSelected');banner.classList.toggle("has-panel",!!p);banner.classList.toggle("no-panel",!p);
 const map={fLength:"length",fWidth:"width",fThickness:"thickness",fQty:"qty",fMaterial:"material",fNotes:"notes"};
 Object.entries(map).forEach(([id,key])=>{let v=p?.[key]??"";if(MEASURE_KEYS.includes(key)&&v!=="")v=mmToUnit(v,currentMeasureUnit());$("#"+id).value=v});
 renderUnitLabels();
 renderMaterialPicker();
 renderNotesPicker();
 const picker=$("#partNamePicker"),chosenSummary=$("#chosenPartSummary");
 if(picker){picker.value=p?.name||state.lastChosenPartName||""}
 if(chosenSummary)chosenSummary.textContent=p?.name||state.lastChosenPartName||"Chosen Parts";
 if(p){p.copies=p.copies||[];p.edgeLong=Number(p.edgeLong||0);p.edgeShort=Number(p.edgeShort||0)}
 updateEdgePreview();
 const totalMarks=p?1+(p.copies?.length||0):0;
 $("#markerCount").textContent=String(totalMarks);
 // Status buttons act on whichever marker is currently selected on the
 // drawing (state.selectedCopy) -- the primary marker if none is picked,
 // or that specific repeated panel -- so ten identical shelves can each
 // be marked installed/missing on their own instead of sharing one status.
 const mark=currentMark(p);
 if(mark)mark.status=mark.status||"ready";
 $("#statusBar").innerHTML=statuses().map(([id,label])=>`<button class="status-btn ${mark?.status===id?"active":""}" data-status="${id}">${label}</button>`).join("");
 $$("[data-status]").forEach(b=>b.onclick=()=>{const mk=currentMark(p);if(mk){mk.status=b.dataset.status;save();renderAll()}})
}
function currentMark(p){
 if(!p)return null;
 const i=Number(state.selectedCopy);
 if(i>=0&&p.copies&&p.copies[i])return p.copies[i];
 return p;
}
function renderPartList(){
 const c=cabinet(),box=$("#partList");box.innerHTML=c?.parts.length?c.parts.map(p=>`<div class="part-row ${p.id===state.currentPart?"active":""}" data-part="${p.id}"><span class="part-code">${p.code}</span><div><strong>${safe(p.name||st('common.unnamedPart'))}</strong><br><small>${p.length||"—"} × ${p.width||"—"} × ${p.thickness||"—"}</small></div><span>${statuses().find(s=>s[0]===p.status)?.[1]||""}</span></div>`).join(""):`<div class="empty">${st('common.noPanelsMarked')}</div>`;
 $$("[data-part]").forEach(r=>r.onclick=()=>{state.currentPart=r.dataset.part;state.selectedCopy=-1;state.focusMarker=true;renderAll()})
}
function renderParts(){
 const allParts=cabinetParts(),parts=allParts.filter(isCompleteSupplierPart),missing=allParts.length-parts.length,box=$("#partsSummary"),warning=$("#componentsValidation");
 if(warning){warning.style.display=missing?"block":"none";warning.innerHTML=missing?`⚠️ ${missing} unfinished panel${missing===1?" is":"s are"} still on the drawing. Add the part name, thickness, length and width before it can appear in Panel Status or the Cutting List.`:""}
 box.innerHTML=parts.length?parts.map(p=>`<div class="part-row"><span class="part-code">${p.code}</span><div><strong>${safe(p.name)}</strong><br><small>${p.length} × ${p.width} × ${p.thickness}${p.material?` · ${safe(p.material)}`:""}</small></div><span>${statuses().find(s=>s[0]===p.status)?.[1]||""}</span></div>`).join(""):`<div class="empty">${st('common.noCompleteComponentsYet')}</div>`
}
function edgeClass(n){return n===1?"edge-1":n===2?"edge-2":""}
function materialForPanel(p){
 const pr=project(),c=cabinet();
 return String(p?.material||pr?.defaultMaterial||c?.lastMaterial||"").trim();
}
function panelDetailsHtml(p){
 const l=safe(p.length||"—"),w=safe(p.width||"—"),t=safe(p.thickness||"—");
 return `<div class="cut-details">${t} mm · <span class="${edgeClass(Number(p.edgeLong||0))}">${l}</span> × <span class="${edgeClass(Number(p.edgeShort||0))}">${w}</span></div><div class="material-small"><strong>${st('common.material')}</strong> ${safe(materialForPanel(p)||st('common.notSet'))}</div>`;
}
function edgeText(p){return `${Number(p.edgeLong||0)} long edge(s), ${Number(p.edgeShort||0)} short edge(s)`}
function isCompleteSupplierPart(p){
 return Boolean(String(p?.code||"").trim() && String(p?.name||"").trim() && Number(p?.thickness)>0 && Number(p?.length)>0 && Number(p?.width)>0);
}
function supplierParts(){return cabinetParts().filter(isCompleteSupplierPart)}
function renderCutting(){
 const allRows=cabinetParts();
 allRows.forEach(p=>{const m=materialForPanel(p);if(m&&!p.material)p.material=m});
 const rows=supplierParts(),missing=allRows.length-rows.length;
 const warning=$("#cuttingValidation");
 if(warning){warning.style.display=missing?"block":"none";warning.innerHTML=missing?`⚠️ ${missing} incomplete part${missing===1?"":"s"} hidden. Add a name, thickness, length and width before sending to the supplier.`:"";}
 $("#cuttingBody").innerHTML=rows.length?rows.map(p=>`<tr>
   <td><strong>${p.code}</strong></td>
   <td>${panelDetailsHtml(p)}</td>
   <td><strong>${p.qty||1}</strong></td>
   <td><div id="cutqr-${p.id}" class="cut-qr"></div></td>
 </tr>`).join(""):'<tr><td colspan="4">No complete parts ready for the supplier.</td></tr>';

 $("#supplierLabels").innerHTML=rows.length?rows.map(p=>`<article class="supplier-label">
   <div>
     <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
       <h3 style="margin:0">${p.code}</h3>
       <strong style="white-space:nowrap">Qty ${p.qty||1}</strong>
     </div>
     ${panelDetailsHtml(p)}
   </div>
   <div id="supplierqr-${p.id}" class="qrbox"></div>
 </article>`).join(""):'<div class="empty">No stickers to print.</div>';

 setTimeout(()=>rows.forEach(p=>{
   makeQr(document.getElementById("cutqr-"+p.id),phoneQrText(p),68);
   makeQr(document.getElementById("supplierqr-"+p.id),phoneQrText(p),92);
 }),0);
}
function localGuideUrl(p){return location.href.split("#")[0]+`#guide=${encodeURIComponent(state.currentProject)}:${encodeURIComponent(state.currentCabinet)}:${encodeURIComponent(p.id)}`}
const DEFAULT_MOBILE_APP_URL="https://assembleone.github.io/assembleone/Mobile.html";
function mobileAppBase(){const stored=(localStorage.getItem("assembleone_mobile_app_url")||"").trim().replace(/#.*$/,'');return stored||DEFAULT_MOBILE_APP_URL}
function phoneQrText(p,copyIndex){
 const pr=project(),c=cabinet();
 // Jobs that started as a phone Site Job are split into one Studio project per room
 // (see mergeMobileSiteJob) and sent back to the phone reassembled under the original
 // mobile job id (see exportProjectToMobile/publish). QR labels must reference that same
 // id -- not this Studio-side split id -- or the phone can never match a scanned code
 // back to the project it actually has.
 const phoneProjectId=pr?.siteMobileJobId||pr?.id||"";
 // copyIndex identifies one specific physical instance of a repeated panel
 // (see p.copies) -- undefined/-1 means the primary marker. Appending it as
 // a 4th route segment keeps existing (no-suffix) QR codes working exactly
 // as before while letting each repeated panel get its own scannable code.
 const idx=Number.isInteger(copyIndex)&&copyIndex>=0?copyIndex:null;
 const route=`${encodeURIComponent(phoneProjectId)}:${encodeURIComponent(c?.id||"")}:${encodeURIComponent(p.id)}${idx!=null?":"+idx:""}`;
 const base=mobileAppBase();
 if(base)return `${base}#panel=${route}`;
 return JSON.stringify({a:"A1",v:8,projectId:phoneProjectId,cabinetId:c?.id||"",panelId:p.id,copyIndex:idx});
}
function makeQr(el,text,size){
 if(!el)return;
 el.innerHTML="";
 if(window.QRCode){
   try{
     new QRCode(el,{text,width:size,height:size,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});
     return true;
   }catch(err){}
 }
 const img=document.createElement("img");
 img.alt="QR code";
 img.src="https://api.qrserver.com/v1/create-qr-code/?size="+(size*2)+"x"+(size*2)+"&margin=8&data="+encodeURIComponent(text);
 img.onerror=()=>{el.innerHTML='<div class="qr-error">QR could not be generated.</div>'};
 el.appendChild(img);
 return true;
}
function renderQr(){
 const urlInput=$("#mobileAppUrl");if(urlInput){urlInput.value=mobileAppBase();urlInput.onchange=()=>{localStorage.setItem("assembleone_mobile_app_url",urlInput.value.trim());renderQr()}}
 const parts=cabinetParts(),box=$("#qrGrid");
 // One QR code per physical panel now, not one per part -- ten identical
 // shelves (see p.copies) get ten separate, individually scannable stickers
 // instead of sharing a single code, so each can be scanned and tracked
 // on its own once it's actually fitted.
 const cards=[];
 parts.forEach(p=>{
   const marks=[{copyIndex:null,status:p.status},...(p.copies||[]).map((m,i)=>({copyIndex:i,status:m.status||"ready"}))];
   marks.forEach((mark,mi)=>cards.push({p,mark,mi,total:marks.length}));
 });
 const cardId=(p,mark)=>p.id+(mark.copyIndex!=null?"-"+mark.copyIndex:"");
 box.innerHTML=cards.length?cards.map(({p,mark,mi,total})=>`<div class="qr-card">
   <div id="qr-${cardId(p,mark)}" style="min-height:155px;display:grid;place-items:center"></div>
   <h3>${p.code}${total>1?` · ${mi+1}/${total}`:""}</h3>
   <div>${safe(p.name||st('common.choosePartName'))}</div>
   <div class="qr-meta">${p.length||"—"} × ${p.width||"—"} × ${p.thickness||"—"} mm<br>${safe(cabinet()?.name||"")} · ${safe(statuses().find(s=>s[0]===mark.status)?.[1]||"")}</div>
   <button class="btn primary test-link" data-test="${p.id}" data-copy="${mark.copyIndex??""}" style="margin-top:8px;width:100%">${st('common.testQr')}</button>
   <div class="qr-test-result" id="qr-test-${cardId(p,mark)}" aria-live="polite">${st('common.notTestedYet')}</div>
 </div>`).join(""):`<div class="empty">${st('common.noPartsInWardrobe')}</div>`;

 setTimeout(()=>cards.forEach(({p,mark})=>{
   const el=document.getElementById("qr-"+cardId(p,mark));
   const link=phoneQrText(p,mark.copyIndex);
   el.innerHTML="";
   if(window.QRCode){
     try{
       new QRCode(el,{text:link,width:150,height:150,colorDark:"#000000",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});
       return;
     }catch(err){}
   }
   const img=document.createElement("img");
   img.className="qr-image";
   img.alt=`QR code for ${p.code}`;
   img.src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data="+encodeURIComponent(link);
   img.onerror=()=>{el.innerHTML='<div class="qr-error">QR needs an internet connection the first time this page is opened.</div>'};
   el.appendChild(img);
 }),0);

 $$("[data-test]").forEach(b=>b.onclick=()=>{
   const selected=cabinetParts().find(p=>p.id===b.dataset.test);
   if(!selected)return;
   const copyIndex=b.dataset.copy!==""?Number(b.dataset.copy):null;
   const result=document.getElementById("qr-test-"+selected.id+(copyIndex!=null?"-"+copyIndex:""));
   const c=cabinet();
   if(!c?.drawing){
     if(result){result.className="qr-test-result warning";result.textContent="Drawing missing — add the drawing before testing";}
     return;
   }
   if(result){
     result.className="qr-test-result success";
     result.textContent=`✓ QR works · Opens ${selected.code} ${selected.name||""} · highlighted on drawing`;
   }
   openGuidePreviewForPanel(selected);
 });
}
function renderPhone(){
 const parts=cabinetParts(),sel=$("#phonePartSelect"),old=state.currentPart||sel.value;sel.innerHTML=parts.length?parts.map(p=>`<option value="${p.id}">${p.code} ${safe(p.name)}</option>`).join(""):'<option>No parts</option>';if(parts.some(p=>p.id===old))sel.value=old;
 const p=parts.find(x=>x.id===sel.value)||parts[0],card=$("#phoneCard");if(!p){card.innerHTML='<div class="empty">No part selected.</div>';return}
 const c=cabinet();const drawing=c?.drawing&&c.drawingType!=="pdf"?`<div class="phone-drawing"><img src="${c.drawing}"><div class="phone-highlight" style="left:${p.x}%;top:${p.y}%"></div></div>`:'<div class="empty">No image drawing attached.</div>';
 card.innerHTML=`${drawing}<h2>${p.code} — ${safe(p.name||st('common.unnamedPart'))}</h2><p><strong>${p.length||"—"} × ${p.width||"—"} × ${p.thickness||"—"} mm</strong></p><p>${safe(p.material)}<br>${edgeText(p)}<br>${safe(c?.name||"")}</p><p>${safe(p.notes)}</p><p><strong>${st('common.status')}</strong> ${safe(statuses().find(s=>s[0]===p.status)?.[1]||p.status)}</p>`
}
function ensureSharedProject(p){
 if(!p)return null;p.rooms=Array.isArray(p.rooms)?p.rooms:[];p.cabinets=Array.isArray(p.cabinets)?p.cabinets:[];
 p.rooms.forEach(r=>{r.name=r.name||"Room";r.type=r.type||r.name;r.icon=r.icon||"⌂";r.beforePhotos=Array.isArray(r.beforePhotos)?r.beforePhotos:[];r.designImages=Array.isArray(r.designImages)?r.designImages:[];r.notes=r.notes||""});
 p.cabinets.forEach(c=>{if(c.roomId==null)c.roomId=""});return p
}
const studioRoomTypes=[["Kitchen","🍳"],["Living Room","🛋️"],["TV Wall","📺"],["Master Bedroom","🛏️"],["Bedroom","🛏️"],["Kids Bedroom","🧸"],["Dressing Room","👕"],["Bathroom","🚿"],["Office","💼"],["Laundry","🧺"],["Utility Room","📦"],["Hallway","🚪"],["Under Stairs","🪜"],["Wine Room","🍷"],["Library","📚"],["Custom","＋"]];
const studioRoomTypeKeyMap={"Kitchen":"kitchen","Living Room":"livingRoom","TV Wall":"tvWall","Master Bedroom":"masterBedroom","Bedroom":"bedroom","Kids Bedroom":"kidsBedroom","Dressing Room":"dressingRoom","Bathroom":"bathroom","Office":"office","Laundry":"laundry","Utility Room":"utilityRoom","Hallway":"hallway","Under Stairs":"underStairs","Wine Room":"wineRoom","Library":"library","Custom":"custom"};
function studioRoomTypeLabel(n){return st('roomType.'+(studioRoomTypeKeyMap[n]||n))}
function suggestedStudioRoomName(type){const p=ensureSharedProject(project());const same=(p?.rooms||[]).filter(r=>r.type===type);return same.length?`${studioRoomTypeLabel(type)} ${same.length+1}`:studioRoomTypeLabel(type)}
function createStudioRoom(type,name,icon){const p=ensureSharedProject(project());if(!p)return alert(st('msg.openProjectFirst'));const clean=(name||"").trim();if(!clean)return;const r={id:uid(),type,name:clean,icon:icon||"🏠",beforePhotos:[],designImages:[],notes:"",siteMarkup:{image:null,w:0,h:0,marks:[]}};p.rooms.push(r);state.currentRoom=r.id;save();renderStudioRoomGuide();updateUnitAddWording()}
function addStudioRoom(){const p=ensureSharedProject(project());if(!p)return alert(st('msg.openProjectFirst'));const overlay=document.createElement("div");overlay.className="room-type-dialog";overlay.innerHTML=`<div class="room-type-sheet"><div class="room-type-top"><h2>${st('common.chooseRoomHeading')}</h2><button class="btn room-type-close" id="closeStudioRoomCreator" aria-label="Close">×</button></div><div class="room-type-help">${st('common.tapPictureRoomHelp')}</div><div class="room-type-grid">${studioRoomTypes.map(([name,icon])=>`<button class="room-type-btn" data-studio-room-type="${safe(name)}" data-studio-room-icon="${icon}"><b>${icon}</b>${safe(studioRoomTypeLabel(name))}</button>`).join("")}</div><div id="studioCustomRoomRow" class="room-name-row hidden"><input id="studioCustomRoomName" placeholder="${st('common.typeRoomNamePlaceholder')}"><button class="btn primary" id="saveStudioCustomRoom">${st('common.addRoomBtn')}</button></div></div>`;document.body.appendChild(overlay);const close=()=>overlay.remove();overlay.querySelector("#closeStudioRoomCreator").onclick=close;overlay.onclick=e=>{if(e.target===overlay)close()};overlay.querySelectorAll("[data-studio-room-type]").forEach(button=>button.onclick=()=>{const type=button.dataset.studioRoomType,icon=button.dataset.studioRoomIcon;if(type==="Custom"){overlay.querySelector("#studioCustomRoomRow").classList.remove("hidden");overlay.querySelector("#studioCustomRoomName").focus();return}createStudioRoom(type,suggestedStudioRoomName(type),icon);close()});overlay.querySelector("#saveStudioCustomRoom").onclick=()=>{const input=overlay.querySelector("#studioCustomRoomName");const name=input.value.trim();if(!name){input.focus();return}createStudioRoom("Custom",name,"🏠");close()};overlay.querySelector("#studioCustomRoomName").onkeydown=e=>{if(e.key==="Enter")overlay.querySelector("#saveStudioCustomRoom").click()}}
function assignCabinetRoom(cabinetId,roomId){const p=ensureSharedProject(project()),c=p?.cabinets.find(x=>x.id===cabinetId);if(!c)return;c.roomId=roomId||"";save();renderStudioRoomGuide();renderProject()}
function openStudioRoom(roomId){
 const p=ensureSharedProject(project()),r=p?.rooms.find(x=>x.id===roomId);if(!p||!r)return;
 const units=p.cabinets.filter(c=>c.roomId===r.id),available=p.cabinets.filter(c=>!c.roomId||!p.rooms.some(room=>room.id===c.roomId));
 const overlay=document.createElement("div");overlay.className="room-type-dialog";
 overlay.innerHTML=`<div class="room-detail-sheet"><div class="room-type-top"><div class="room-detail-title"><b>${r.icon||"🏠"}</b><h2>${safe(r.name)}</h2></div><button class="btn room-type-close" data-close-room-detail aria-label="Close">×</button></div>
 <div class="room-detail-section"><h3>${st('common.installerNotesHeading')}</h3><textarea data-detail-room-notes placeholder="${st('common.accessOrderPlaceholder')}">${safe(r.notes||"")}</textarea></div>
 <div class="room-detail-section"><h3>${st('common.inThisRoomHeading')}</h3><div class="room-detail-unit-grid">${units.length?units.map(c=>`<button class="room-detail-unit" data-detail-remove-unit="${c.id}">✓ ${safe(c.name)}<small>${c.parts?.length||0} ${st('common.panelsTapToRemove')}</small></button>`).join(""):`<div class="room-simple-empty">${st('common.noWardrobeCabinetYet')}</div>`}</div></div>
 <div class="room-detail-section"><h3>${st('common.addWardrobeCabinetHeading')}</h3><div class="room-detail-unit-grid">${available.length?available.map(c=>`<button class="room-detail-unit" data-detail-add-unit="${c.id}">＋ ${safe(c.name)}<small>${c.parts?.length||0} ${st('common.panelsWord')}</small></button>`).join(""):`<div class="room-simple-empty">${st('common.noUnassignedUnits')}</div>`}</div></div>
 <div class="room-detail-actions"><button class="btn" data-detail-rename>${st('common.renameRoomBtn')}</button><button class="btn danger" data-detail-delete>${st('common.deleteRoomBtn')}</button><button class="btn primary" data-close-room-detail>${st('common.done')}</button></div></div>`;
 document.body.appendChild(overlay);const close=()=>{overlay.remove();renderStudioRoomGuide()};
 overlay.onclick=e=>{if(e.target===overlay)close()};overlay.querySelectorAll('[data-close-room-detail]').forEach(x=>x.onclick=close);
 const notes=overlay.querySelector('[data-detail-room-notes]');notes.onchange=()=>{r.notes=notes.value;save()};
 overlay.querySelectorAll('[data-detail-add-unit]').forEach(x=>x.onclick=()=>{assignCabinetRoom(x.dataset.detailAddUnit,r.id);overlay.remove();openStudioRoom(r.id)});
 overlay.querySelectorAll('[data-detail-remove-unit]').forEach(x=>x.onclick=()=>{assignCabinetRoom(x.dataset.detailRemoveUnit,"");overlay.remove();openStudioRoom(r.id)});
 overlay.querySelector('[data-detail-rename]').onclick=()=>{const name=prompt(st('common.roomNamePrompt'),r.name||"");if(name?.trim()){r.name=name.trim();save();overlay.remove();openStudioRoom(r.id)}};
 overlay.querySelector('[data-detail-delete]').onclick=()=>{if(confirm(st('msg.confirmDeleteRoomUnassigned',[r.name]))){p.cabinets.forEach(c=>{if(c.roomId===r.id)c.roomId=""});p.rooms=p.rooms.filter(x=>x.id!==r.id);save();close()}};
}
function renderStudioRoomGuide(){
 const box=$("#studioRoomGuide");if(!box)return;const p=ensureSharedProject(project());if(!p){box.innerHTML=`<div class="empty">${st('msg.openProjectFirst')}</div>`;return}
 const unassigned=p.cabinets.filter(c=>!c.roomId||!p.rooms.some(r=>r.id===c.roomId));
 const rooms=p.rooms.map(r=>{const units=p.cabinets.filter(c=>c.roomId===r.id);return `<button class="room-dashboard-btn" data-open-studio-room="${r.id}"><span class="room-dashboard-icon">${r.icon||"🏠"}</span><span class="room-dashboard-name">${safe(r.name)}</span><span class="room-dashboard-count">${st('common.wardrobeOrCabinetCount',[units.length])}</span></button>`}).join("");
 const warning=unassigned.length?`<button class="room-dashboard-btn room-dashboard-warning" data-open-unassigned-room><span class="room-dashboard-icon">＋</span><span class="room-dashboard-name">${st('common.placeUnitsBtn',[unassigned.length])}</span><span class="room-dashboard-count">${st('common.tapRoomAddUnit')}</span></button>`:"";
 box.innerHTML=p.rooms.length?`<div class="room-dashboard-grid">${rooms}${warning}</div>`:`<div class="room-simple-empty">${st('common.noRoomSelectedYet')}</div>`;
 $$('[data-open-studio-room]').forEach(x=>x.onclick=()=>{state.currentRoom=x.dataset.openStudioRoom;save();updateUnitAddWording();openStudioRoom(x.dataset.openStudioRoom)});
 const unBtn=$('[data-open-unassigned-room]');if(unBtn)unBtn.onclick=()=>{if(p.rooms[0])openStudioRoom(p.rooms[0].id);else addStudioRoom()};
}

function buildJobBom(p){
 p=ensureSharedProject(p);if(!p)return null;
 const rooms=(p.rooms||[]).map(r=>{const units=(p.cabinets||[]).filter(c=>c.roomId===r.id);return {id:r.id,name:r.name,icon:r.icon||"🏠",notes:r.notes||"",units:units.map(c=>({id:c.id,name:c.name,panels:(c.parts||[]).length,pieces:(c.parts||[]).reduce((n,x)=>n+(Number(x.qty)||1),0)}))}});
 const unassigned=(p.cabinets||[]).filter(c=>!c.roomId||!(p.rooms||[]).some(r=>r.id===c.roomId));
 const all=(p.cabinets||[]).flatMap(c=>(c.parts||[]).map(x=>({...x,cabinetName:c.name,roomId:c.roomId||""})));
 const materials={};all.forEach(x=>{const key=(x.material||"Material not set").trim()||"Material not set";materials[key]=(materials[key]||0)+(Number(x.qty)||1)});
 const counts={rooms:(p.rooms||[]).length,units:(p.cabinets||[]).length,panels:all.length,pieces:all.reduce((n,x)=>n+(Number(x.qty)||1),0),installed:all.filter(x=>x.status==="installed").length,missing:all.filter(x=>x.status==="missing").length,damaged:all.filter(x=>x.status==="damaged").length};
 return {version:1,createdAt:new Date().toISOString(),projectId:p.id,projectName:p.name||"Job",customer:p.customer||"",counts,materials,rooms,unassigned:unassigned.map(c=>({id:c.id,name:c.name,panels:(c.parts||[]).length,pieces:(c.parts||[]).reduce((n,x)=>n+(Number(x.qty)||1),0)}))};
}
function renderJobBom(){
 const box=$("#jobBom"),p=project();
 if(!box)return;
 if(!p){box.innerHTML='<div class="empty">Open a job first.</div>';return}
 p.bom=buildJobBom(p);const b=p.bom;
 const cabinets=p.cabinets||[],all=cabinets.flatMap(c=>c.parts||[]);
 const activeRoomId=state.currentRoom||p.rooms?.[0]?.id||"";
 const activeRoom=p.rooms?.find(r=>r.id===activeRoomId)||p.rooms?.[0]||null;
 const activeCabinets=activeRoom?cabinets.filter(c=>c.roomId===activeRoom.id):cabinets;
 const roomsReady=!!activeRoom;
 const drawingReady=activeCabinets.some(c=>!!c.drawing)||cabinets.some(c=>!!c.drawing);
 const panelReady=all.length>0&&all.every(x=>typeof window.isCompleteSupplierPart==='function'?window.isCompleteSupplierPart(x):false);
 const qrReady=all.length>0&&!!p.qrReady;
 const notesReady=!!String(p.notes||'').trim()||all.some(x=>String(x.notes||'').trim());
 const card=(cls,icon,title,target)=>`<button type="button" class="finish-status-card ${cls?'complete':'missing'}" data-finish-target="${target}"><span class="finish-status-mark">${cls?'✓':'!'}</span><span class="finish-status-icon">${icon}</span><strong>${title}</strong></button>`;
 const orderedRooms=[...b.rooms].sort((a,b)=>a.id===activeRoomId?-1:b.id===activeRoomId?1:0);
 const roomHtml=orderedRooms.map(r=>{
   const unitText=r.units.length===1?st('common.oneUnit'):st('common.unitsCount',[r.units.length]);
   const pieceCount=r.units.reduce((n,u)=>n+u.pieces,0);
   const selected=r.id===activeRoomId;
   return `<div class="finish-room-card ${selected?'selected-room':''}"><span class="finish-room-icon">${safe(r.icon||"🏠")}</span><div class="finish-room-copy"><strong>${safe(r.name)}</strong><span>${selected?st('common.selectedRoomPrefix'):''}${unitText} · ${st('common.piecesCount',[pieceCount])}</span></div><span class="finish-room-tick">✓</span></div>`
 }).join("");
 const allReady=roomsReady&&drawingReady&&panelReady&&qrReady&&notesReady;
 box.innerHTML=`
   <div class="finish-job-card">
     <span class="finish-job-icon">📁</span>
     <div class="finish-job-copy"><strong>${safe(p.name||st('common.untitledJob'))}</strong><span>👤 ${safe(p.customer||st('common.noCustomerName'))}</span></div>
     <span class="finish-job-tick">✓</span>
   </div>
   <div class="finish-status-grid finish-status-grid-five">
     ${card(roomsReady,activeRoom?.icon||'🏠',activeRoom?.name||st('common.chooseRoomBtn'),'jobs')}
     ${card(drawingReady,'📐',st('step.drawing'),'mark')}
     ${card(panelReady,'☑️',st('common.panelCheck'),'parts')}
     ${card(qrReady,'▦',st('common.qrPanelsTitle'),'qr')}
     ${card(notesReady,'📝',st('common.projectNotesTitle'),'project-notes')}
   </div>
   <h3 class="finish-section-title">${st('common.roomsHeading')}</h3>
   <div class="finish-room-list">${roomHtml||`<div class="empty">${st('common.noRoomsYet')}</div>`}</div>
   <div class="finish-compact-summary"><span>${b.counts.rooms} ${st('common.roomsWord')}</span><span>${b.counts.units} ${st('common.unitsWord')}</span><span>${b.counts.panels} ${st('common.panelsWord')}</span><span>${b.counts.pieces} ${st('common.piecesWord')}</span><span>${Object.keys(b.materials).length} ${st('common.materialsWord')}</span></div>
   <div class="finish-ready-banner ${allReady?'ready':''}"><span class="ready-icon">${allReady?'✓':'!'}</span><span>${allReady?st('common.everythingReady'):st('common.checkRedCardsBeforeSending')}</span></div>`;
 document.querySelectorAll('[data-finish-target]').forEach(btn=>btn.onclick=()=>{const target=btn.dataset.finishTarget;if(target==='project-notes'){openProjectNotesEditor();return}show(target)});
 const noteBox=document.getElementById('finishPhoneNote');if(noteBox&&document.activeElement!==noteBox)noteBox.value=p.notes||'';
 save()
}
function renderAll(){state.projects.forEach(ensureSharedProject);renderHeader();renderJobs();renderProject();renderCabinetSelect();renderRooms();renderStudioRoomGuide();renderForm();renderPartList();renderParts();renderCutting();renderQr();renderPhone();renderJobBom();updateUnitAddWording();renderCustomers();show(state.screen||"jobs")}

const UNIT_FACTORS={mm:1,cm:10,in:25.4};
function currentMeasureUnit(){try{return state.units||"mm"}catch(e){return "mm"}}
function mmToUnit(mm,unit){if(mm===""||mm==null||isNaN(mm))return mm;const f=UNIT_FACTORS[unit||"mm"]||1;return Math.round((Number(mm)/f)*100)/100}
function unitToMM(val,unit){if(val===""||val==null||isNaN(val))return val;const f=UNIT_FACTORS[unit||"mm"]||1;return Math.round(Number(val)*f*100)/100}
function unitLabel(unit){return unit||"mm"}
const MEASURE_KEYS=["length","width","thickness"];
function renderUnitLabels(){const u=unitLabel(currentMeasureUnit());["thicknessUnitLabel","lengthUnitLabel","widthUnitLabel"].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=u})}
const THICKNESS_DEFAULT_KEY="assembleone_default_thickness_mm";
function getDefaultThicknessMM(){const v=Number(localStorage.getItem(THICKNESS_DEFAULT_KEY));return v>0?v:19}
function setDefaultThicknessMM(mm){mm=Number(mm);if(mm>0)try{localStorage.setItem(THICKNESS_DEFAULT_KEY,String(mm))}catch(e){}}
function bindField(id,key){$("#"+id).oninput=()=>{const p=part();if(!p)return;let val=["length","width","thickness","qty"].includes(key)?($("#"+id).value===""?"":+$("#"+id).value):$("#"+id).value;if(MEASURE_KEYS.includes(key)&&val!=="")val=unitToMM(val,currentMeasureUnit());p[key]=val;if(val!==""&&(key==="thickness"||key==="length"||key==="width")){const c=cabinet();if(c){if(key==="thickness"){c.lastThickness=val;setDefaultThicknessMM(val)}else if(key==="length"){c.lastLength=val}else if(key==="width"){c.lastWidth=val}}}save();renderPartList();renderCutting();renderPhone()}}
["fLength","fWidth","fQty"].forEach(id=>{const el=$("#"+id);if(el)el.placeholder=""});
["fLength:length","fWidth:width","fThickness:thickness","fQty:qty","fNotes:notes"].forEach(x=>{const[a,b]=x.split(":");bindField(a,b)});
function setPartName(name){state.lastChosenPartName=name;const p=part();if(p)p.name=name;save();renderAll()}
$$(".nav-btn").forEach(b=>b.onclick=()=>show(b.dataset.screen));
const toolsToggle=document.getElementById('toolsToggleBtn');const toolsMenu=document.getElementById('toolsMenu');if(toolsToggle&&toolsMenu){toolsToggle.onclick=(e)=>{e.stopPropagation();toolsMenu.classList.toggle('open')};document.addEventListener('click',(e)=>{if(!e.target.closest('.studio-tools'))toolsMenu.classList.remove('open')});}
$("#newJobBtn").onclick=newJob;$("#newCabinetBtn").onclick=addCabinet;$("#studioAddRoomBtn").onclick=addStudioRoom;$("#studioRoomBackBtn").onclick=()=>show("jobs");
$("#saveProjectBtn").onclick=()=>{const p=project();if(!p)return;p.name=$("#projectName").value;p.customer=$("#customerName").value;save();renderAll();alert(st('msg.jobSaved'))};

function crc32(bytes){let c=-1;for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xEDB88320:0)}return(c^-1)>>>0}
function u16(a,o,v){a[o]=v&255;a[o+1]=(v>>>8)&255}function u32(a,o,v){a[o]=v&255;a[o+1]=(v>>>8)&255;a[o+2]=(v>>>16)&255;a[o+3]=(v>>>24)&255}
function makeZip(files){const enc=new TextEncoder(),locals=[],centrals=[];let offset=0;for(const f of files){const name=enc.encode(f.name),data=typeof f.data==='string'?enc.encode(f.data):f.data,crc=crc32(data);const l=new Uint8Array(30+name.length+data.length);u32(l,0,0x04034b50);u16(l,4,20);u16(l,6,0);u16(l,8,0);u16(l,10,0);u16(l,12,0);u32(l,14,crc);u32(l,18,data.length);u32(l,22,data.length);u16(l,26,name.length);u16(l,28,0);l.set(name,30);l.set(data,30+name.length);locals.push(l);const c=new Uint8Array(46+name.length);u32(c,0,0x02014b50);u16(c,4,20);u16(c,6,20);u16(c,8,0);u16(c,10,0);u16(c,12,0);u16(c,14,0);u32(c,16,crc);u32(c,20,data.length);u32(c,24,data.length);u16(c,28,name.length);u16(c,30,0);u16(c,32,0);u16(c,34,0);u16(c,36,0);u32(c,38,0);u32(c,42,offset);c.set(name,46);centrals.push(c);offset+=l.length}const cs=centrals.reduce((n,x)=>n+x.length,0),end=new Uint8Array(22);u32(end,0,0x06054b50);u16(end,8,files.length);u16(end,10,files.length);u32(end,12,cs);u32(end,16,offset);const all=[...locals,...centrals,end],size=all.reduce((n,x)=>n+x.length,0),out=new Uint8Array(size);let p=0;for(const x of all){out.set(x,p);p+=x.length}return new Blob([out],{type:'application/zip'})}
async function readZip(file){const a=new Uint8Array(await file.arrayBuffer()),dec=new TextDecoder(),out={};let p=0;while(p+30<=a.length&&((a[p]|a[p+1]<<8|a[p+2]<<16|a[p+3]<<24)>>>0)===0x04034b50){const method=a[p+8]|a[p+9]<<8,sz=(a[p+18]|a[p+19]<<8|a[p+20]<<16|a[p+21]<<24)>>>0,nl=a[p+26]|a[p+27]<<8,el=a[p+28]|a[p+29]<<8,name=dec.decode(a.slice(p+30,p+30+nl)),start=p+30+nl+el;if(method!==0)throw new Error('Unsupported compressed ZIP');out[name]=a.slice(start,start+sz);p=start+sz}return out}
function jsonFromZip(entries){const key=Object.keys(entries).find(x=>/project\.json$/i.test(x)||/updates\.json$/i.test(x));if(!key)throw new Error('project.json missing');return JSON.parse(new TextDecoder().decode(entries[key]))}

function download(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
function downloadA1(data,name){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:"application/json"}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}
function cleanFileName(name){return String(name||"AssembleOne_Job").replace(/[^\w-]+/g,"_")}
function buildProjectRecordZip(projectId){
 const p=ensureSharedProject(state.projects.find(x=>x.id===projectId));if(!p)return null;
 const row=[p.customer||"",p.name||"",p.address||"",p.phone||"",(p.rooms||[]).length,(p.cabinets||[]).length,new Date().toLocaleDateString()];
 const summary="Customer,Project,Address,Phone,Rooms,Units,Exported\n"+row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',');
 const pack={app:"AssembleOne",schema:"assembleone-archive-v1",exportedAt:new Date().toISOString(),project:p};
 const blob=makeZip([{name:"project.json",data:JSON.stringify(pack)},{name:"tradebase-summary.csv",data:summary},{name:"README.txt",data:"Technical AssembleOne project record for attaching to the customer in your trade database."}]);
 return {blob,name:cleanFileName((p.customer||p.name||"Project")+"_AssembleOne_Record")+".zip"};
}
function exportProjectRecord(projectId){
 const rec=buildProjectRecordZip(projectId);
 if(!rec)return alert(st('msg.projectNotFound'));
 download(rec.blob,rec.name);
}
function wireJobDragOut(scopeEl){
 (scopeEl||document).querySelectorAll('[data-drag-job]').forEach(card=>{
  card.addEventListener('dragstart',e=>{
   const id=card.dataset.dragJob;
   const p=state.projects.find(x=>x.id===id);
   const rec=buildProjectRecordZip(id);
   if(!rec){e.preventDefault();return}
   const url=URL.createObjectURL(rec.blob);
   const photo=p?customerRoomPhoto(p):"";
   const lines=[
    p?.customer?`Customer: ${p.customer}`:null,
    p?.address?`Address: ${p.address}`:null,
    p?.phone?`Phone: ${p.phone}`:null,
    `Job: ${p?.name||"Untitled job"}`,
    `${(p?.rooms||[]).length} room${(p?.rooms||[]).length===1?"":"s"} · ${(p?.cabinets||[]).length} unit${(p?.cabinets||[]).length===1?"":"s"}`
   ].filter(Boolean);
   e.dataTransfer.effectAllowed="copy";
   // Multiple formats at once, since we can't know how the drop target (the
   // desktop, or another site's own note/attachment field) reads a drag:
   // DownloadURL/uri-list is what makes a real .zip file appear on the desktop
   // or in Finder/Explorer; text/html carries the customer details AND the
   // photo for a rich-text drop target (like a notes box); text/plain is the
   // fallback for a plain text field.
   e.dataTransfer.setData("DownloadURL",`application/zip:${rec.name}:${url}`);
   e.dataTransfer.setData("text/uri-list",url);
   e.dataTransfer.setData("text/html",`<div>${lines.map(l=>safe(l)).join("<br>")}${photo?`<br><img src="${photo}" style="max-width:240px;display:block;margin-top:6px">`:""}</div>`);
   e.dataTransfer.setData("text/plain",lines.join("\n"));
   setTimeout(()=>URL.revokeObjectURL(url),30000);
  });
 });
}
async function mobileSyncDb(){return new Promise((resolve,reject)=>{const q=indexedDB.open("assembleone_direct_sync_v1",2);q.onupgradeneeded=()=>{const db=q.result;if(!db.objectStoreNames.contains("studioInbox"))db.createObjectStore("studioInbox",{keyPath:"syncId"});if(!db.objectStoreNames.contains("mobileInbox"))db.createObjectStore("mobileInbox",{keyPath:"syncId"})};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
const ASSEMBLEONE_FIREBASE_URL="https://assembleone-fabac-default-rtdb.firebaseio.com";
function firebaseSafeKey(value){return String(value||uid()).replace(/[.#$\[\]/]/g,"_")}
async function firebasePut(path,value){const r=await fetch(`${ASSEMBLEONE_FIREBASE_URL}/${path}.json`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(value)});if(!r.ok)throw new Error(`Firebase write failed: ${r.status}`);return r.json()}
async function firebaseGet(path){const r=await fetch(`${ASSEMBLEONE_FIREBASE_URL}/${path}.json`,{cache:"no-store"});if(!r.ok)throw new Error(`Firebase read failed: ${r.status}`);return r.json()}
async function firebaseDelete(path){const r=await fetch(`${ASSEMBLEONE_FIREBASE_URL}/${path}.json`,{method:"DELETE"});if(!r.ok)throw new Error(`Firebase delete failed: ${r.status}`)}
// sendPackToPhoneDirectly/exportProjectToMobile (the original, pre-channel Studio-to-
// phone sender) lived here. It has no live caller left -- the "10.89 separate reliable
// Supplier and Site Job sending" block (publish/publishNote) is what the actual
// Send Cutting List/Send Note buttons use now -- so it was removed instead of being
// left as a second, easy-to-mistakenly-edit copy of the same job.
function mergeMobileSiteJob(incoming){
 if(!incoming?.id)throw new Error("Invalid project");
 const rooms=(incoming.rooms&&incoming.rooms.length)?incoming.rooms:[null];
 let focusProject=null;
 rooms.forEach((room,idx)=>{
  const projectId=room?(incoming.id+"__"+room.id):incoming.id;
  const roomCabinets=(incoming.cabinets||[]).filter(c=>room?c.roomId===room.id:!c.roomId);
  let base=state.projects.find(x=>x.id===projectId);
  if(!base){
   base=ensureSharedProject({
    id:projectId,
    name:room?(room.name||incoming.name||"Site job"):(incoming.name||"Site job"),
    customer:incoming.customer||"",
    address:incoming.address||"",
    phone:incoming.phone||"",
    notes:incoming.notes||"",
    geoLat:incoming.geoLat,geoLng:incoming.geoLng,
    siteMobileJobId:incoming.id,
    rooms:room?[JSON.parse(JSON.stringify(room))]:[],
    cabinets:JSON.parse(JSON.stringify(roomCabinets))
   });
   state.projects.unshift(base);
  }else{
   ["customer","address","phone","notes","geoLat","geoLng"].forEach(k=>{if(incoming[k]!==undefined&&incoming[k]!==""&&incoming[k]!==null)base[k]=incoming[k]});
   if(room){
    base.rooms=base.rooms||[];
    let br=base.rooms.find(x=>x.id===room.id);
    if(!br)base.rooms.unshift(JSON.parse(JSON.stringify(room)));else Object.assign(br,JSON.parse(JSON.stringify(room)));
   }
   base.cabinets=base.cabinets||[];
   roomCabinets.forEach(rc=>{let bc=base.cabinets.find(x=>x.id===rc.id);if(!bc)base.cabinets.push(JSON.parse(JSON.stringify(rc)));else Object.assign(bc,JSON.parse(JSON.stringify(rc)))});
  }
  if(idx===0)focusProject=base;
 });
 // Each room becomes its own Studio project, but a customer name typed in on any single
 // room's send should apply to the whole job -- otherwise rooms sent before the customer
 // name was filled in stay permanently blank and split off from the rest of the job.
 const siblings=state.projects.filter(x=>x.siteMobileJobId===incoming.id);
 const knownCustomer=siblings.map(x=>customerKey(x.customer)).find(Boolean);
 if(knownCustomer)siblings.forEach(x=>{if(!customerKey(x.customer))x.customer=knownCustomer});
 return focusProject;
}
function customerKey(name){return String(name||"").trim()}
function allCustomerEntries(){
 const map=new Map();
 (state.customers||[]).forEach(c=>{
  const key=customerKey(c.name);
  if(!key)return;
  map.set(key,{id:c.id,name:c.name,address:c.address||"",phone:c.phone||"",notes:c.notes||"",geoLat:null,geoLng:null,projects:[]});
 });
 // A phone site job is split into one Studio project per room (see mergeMobileSiteJob),
 // so resolve one shared customer key per siteMobileJobId first -- using any sibling
 // room's customer name if this one hasn't got it yet -- instead of letting rooms of the
 // same job scatter across different (or missing) customer entries.
 const jobKeys=new Map();
 (state.projects||[]).forEach(p=>{
  if(!p.siteMobileJobId||jobKeys.has(p.siteMobileJobId))return;
  const sibling=(state.projects||[]).find(x=>x.siteMobileJobId===p.siteMobileJobId&&customerKey(x.customer));
  if(sibling)jobKeys.set(p.siteMobileJobId,customerKey(sibling.customer));
 });
 const noCustomerLabels=new Map();
 (state.projects||[]).forEach(p=>{
  let key=customerKey(p.customer)||(p.siteMobileJobId&&jobKeys.get(p.siteMobileJobId));
  if(!key&&p.siteMobileJobId){
   // A job sent from the phone before a customer name was typed would otherwise vanish
   // from this screen entirely (it never gets a key). Group it under a findable label
   // instead of dropping it, so nothing sent from site ever disappears from view.
   if(!noCustomerLabels.has(p.siteMobileJobId)){
    const label=(p.name||(p.rooms&&p.rooms[0]&&p.rooms[0].name)||"Site job").trim();
    noCustomerLabels.set(p.siteMobileJobId,"No customer name — "+label);
   }
   key=noCustomerLabels.get(p.siteMobileJobId);
  }
  if(!key)return;
  if(!map.has(key))map.set(key,{id:null,name:key,address:"",phone:"",notes:"",geoLat:null,geoLng:null,projects:[]});
  const entry=map.get(key);
  entry.projects.push(p);
  if(!entry.address&&p.address)entry.address=p.address;
  if(entry.geoLat==null&&p.geoLat!=null){entry.geoLat=p.geoLat;entry.geoLng=p.geoLng}
 });
 return map;
}
function customerMapUrl(entry){
 if(!entry)return null;
 if(entry.geoLat!=null&&entry.geoLng!=null)return `https://www.google.com/maps/search/?api=1&query=${entry.geoLat},${entry.geoLng}`;
 if(entry.address)return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entry.address)}`;
 return null;
}
function openNewCustomerForm(){
 const form=document.getElementById("newCustomerForm");
 if(!form)return;
 document.getElementById("newCustomerName").value="";
 document.getElementById("newCustomerAddress").value="";
 document.getElementById("newCustomerPhone").value="";
 form.classList.remove("hidden");
 form.scrollIntoView({behavior:"smooth",block:"start"});
 document.getElementById("newCustomerName").focus();
}
function saveNewCustomer(){
 const name=document.getElementById("newCustomerName").value.trim();
 if(!name){alert(st('msg.enterCustomerName'));return}
 if([...allCustomerEntries().keys()].some(k=>k.toLowerCase()===name.toLowerCase())){alert(st('msg.customerAlreadyExists',[name]));return}
 const address=document.getElementById("newCustomerAddress").value.trim();
 const phone=document.getElementById("newCustomerPhone").value.trim();
 state.customers=state.customers||[];
 state.customers.push({id:uid(),name,address,phone,notes:"",createdAt:new Date().toISOString()});
 document.getElementById("newCustomerForm").classList.add("hidden");
 save();renderCustomers();
}
document.getElementById("cancelNewCustomerBtn")?.addEventListener("click",()=>document.getElementById("newCustomerForm").classList.add("hidden"));
document.getElementById("saveNewCustomerBtn")?.addEventListener("click",saveNewCustomer);
function customerRoomPhoto(p){
 const r=(p.rooms||[])[0]||{};
 return (r.measureCaptures||[])[0]?.image||r.siteMarkup?.image||(r.beforePhotos||[])[0]?.data||(r.designImages||[])[0]?.data||"";
}
function customerRoomCounts(p){
 const r=(p.rooms||[])[0]||{};
 const photos=(r.measureCaptures?.length||0)+(r.beforePhotos?.length||0)+(r.designImages?.length||0)+(r.sitePhotos?.length||0)+(r.notePhotos?.length||0);
 const measures=(r.siteMarkup?.marks?.filter(x=>x.type==="measure").length||0)+(r.measureCaptures||[]).reduce((n,c)=>n+(c.marks||[]).filter(x=>x.type==="measure").length,0);
 return {photos,measures};
}
// A Site Job sent from the phone gets split into one Studio project per room
// (see mergeMobileSiteJob), so two rooms of the exact same phone job show up
// as separate-looking cards here. Without a visible link between them, a
// second room's card reads as an accidental duplicate of the first -- which
// is exactly what led to a job's photos being deleted by mistake. Surface
// that link wherever these cards render, and in the delete confirmation.
function siblingRoomInfo(p){
 if(!p?.siteMobileJobId)return null;
 const siblings=(state.projects||[]).filter(x=>x.siteMobileJobId===p.siteMobileJobId);
 if(siblings.length<2)return null;
 const index=siblings.findIndex(x=>x.id===p.id)+1;
 return {index,total:siblings.length,names:siblings.map(x=>x.name||"Room")};
}
function deleteJobConfirmMessage(p){
 const r=(p.rooms||[])[0]||{};
 const photoCount=(r.measureCaptures?.length||0)+(r.beforePhotos?.length||0)+(r.designImages?.length||0)+(r.sitePhotos?.length||0);
 const sib=siblingRoomInfo(p);
 let msg=st('msg.confirmDeleteJobBase',[p.name]);
 if(photoCount)msg+=st('msg.confirmDeleteJobPhotos',[photoCount]);
 if(sib)msg+=st('msg.confirmDeleteJobSibling',[sib.index,sib.total,sib.names.join(", ")]);
 return msg;
}
let currentCustomerName=null;
let customerSearchTerm="";
function renderCustomers(){
 const listView=document.getElementById("customerListView"),detailView=document.getElementById("customerDetailView");
 if(!listView||!detailView)return;
 const map=allCustomerEntries();
 if(currentCustomerName&&!map.has(currentCustomerName))currentCustomerName=null;
 if(currentCustomerName){
  listView.classList.add("hidden");detailView.classList.remove("hidden");
  renderCustomerDetail(currentCustomerName,map.get(currentCustomerName));
  return;
 }
 listView.classList.remove("hidden");detailView.classList.add("hidden");
 document.getElementById("newCustomerForm")?.classList.add("hidden");
 const list=document.getElementById("customerList");
 if(!list)return;
 const searchBox=document.getElementById("customerSearch");
 if(searchBox&&document.activeElement!==searchBox)searchBox.value=customerSearchTerm;
 let entries=[...map.entries()];
 if(customerSearchTerm.trim()){
  const term=customerSearchTerm.trim().toLowerCase();
  entries=entries.filter(([name,e])=>name.toLowerCase().includes(term)||(e.address||"").toLowerCase().includes(term));
 }
 entries.sort((a,b)=>a[0].localeCompare(b[0]));
 if(!entries.length){list.innerHTML=`<div class="empty">${map.size?st('common.noCustomersMatchSearch'):st('common.noCustomersYet')}</div>`;return}
 list.innerHTML=entries.map(([name,e])=>{
  const jobCount=e.projects.length;
  return `<button class="customer-row" type="button" data-customer="${safe(name)}"><span class="customer-row-info"><strong>${safe(name)}</strong>${e.address?`<span class="customer-row-address">${safe(e.address)}</span>`:""}</span>${jobCount?`<span class="customer-row-count">${st('common.jobsCount',[jobCount])}</span>`:""}<span class="customer-row-arrow">›</span></button>`;
 }).join("");
 list.querySelectorAll("[data-customer]").forEach(b=>b.onclick=()=>{currentCustomerName=b.dataset.customer;renderCustomers()});
}
function renderCustomerDetail(name,entry){
 const projects=entry?.projects||[];
 const nameEl=document.getElementById("customerDetailName"),addrEl=document.getElementById("customerDetailAddress"),jobList=document.getElementById("customerJobList");
 if(nameEl)nameEl.textContent=name;
 const mapUrl=customerMapUrl(entry);
 if(addrEl){
  if(entry?.address&&mapUrl)addrEl.innerHTML=`📍 ${safe(entry.address)} <a href="${mapUrl}" target="_blank" rel="noopener" class="customer-map-link">${st('common.openInMapsLink')}</a>`;
  else if(mapUrl)addrEl.innerHTML=`<a href="${mapUrl}" target="_blank" rel="noopener" class="customer-map-link">${st('common.openPinnedLocationMaps')}</a>`;
  else addrEl.textContent="";
 }
 if(jobList)jobList.innerHTML=projects.length?projects.map(p=>{
  const r=(p.rooms||[])[0]||{};
  const photo=customerRoomPhoto(p);
  const {photos,measures}=customerRoomCounts(p);
  const sib=siblingRoomInfo(p);
  const sibTag=sib?`<div class="sibling-room-tag" title="${safe(sib.names.join(', '))}">${st('common.siblingRoomTag',[sib.index,sib.total])}</div>`:'';
  return `<div class="customer-job-card" draggable="true" data-drag-job="${safe(p.id)}" title="${st('common.dragToTradeDbTitle')}">${photo?`<img class="customer-job-photo" src="${photo}">`:`<div class="customer-job-photo customer-job-photo-empty">${safe(r.icon||"🏠")}</div>`}<div class="customer-job-info"><strong>${safe(r.icon||"🏠")} ${safe(p.name||r.name||st('common.roomFallback'))}</strong><span class="customer-job-meta"><span>📷 ${photos}</span><span>📏 ${measures}</span></span>${sibTag}</div><div class="customer-job-actions"><button class="btn primary" type="button" data-open-customer-project="${safe(p.id)}">${st('common.openArrowBtn')}</button><button class="btn danger" type="button" data-delete-customer-project="${safe(p.id)}">${st('common.delete')}</button></div></div>`;
 }).join(""):`<div class="empty">${st('common.noJobsYetCustomer')}</div>`;
 if(jobList)wireJobDragOut(jobList);
 if(jobList)jobList.querySelectorAll("[data-open-customer-project]").forEach(b=>b.onclick=()=>{
  state.currentProject=b.dataset.openCustomerProject;
  const p=project();
  const c=p?ensureSiteReferenceCabinet(p):null;
  state.currentCabinet=c?.id||p?.cabinets?.[0]?.id||null;
  state.currentPart=null;
  save();renderAll();show("mark");
 });
 if(jobList)jobList.querySelectorAll("[data-delete-customer-project]").forEach(b=>b.onclick=()=>{
  const id=b.dataset.deleteCustomerProject;
  const p=(state.projects||[]).find(x=>x.id===id);
  if(!p)return;
  if(!confirm(deleteJobConfirmMessage(p)))return;
  state.projects=state.projects.filter(x=>x.id!==id);
  if(state.currentProject===id){state.currentProject=null;state.currentCabinet=null;state.currentPart=null}
  save();renderAll();
 });
 const backBtn=document.getElementById("backToCustomerList");
 if(backBtn)backBtn.onclick=()=>{currentCustomerName=null;renderCustomers()};
 const editForm=document.getElementById("customerEditForm");
 if(editForm)editForm.classList.add("hidden");
 const editBtn=document.getElementById("editCustomerBtn");
 if(editBtn)editBtn.onclick=()=>openCustomerEditForm(name,entry);
 const deleteBtn=document.getElementById("deleteCustomerBtn");
 if(deleteBtn)deleteBtn.onclick=()=>deleteCustomer(name);
}
function openCustomerEditForm(name,entry){
 const form=document.getElementById("customerEditForm");
 if(!form)return;
 document.getElementById("editCustomerName").value=entry.name||"";
 document.getElementById("editCustomerAddress").value=entry.address||"";
 document.getElementById("editCustomerPhone").value=entry.phone||"";
 form.classList.remove("hidden");
 form.scrollIntoView({behavior:"smooth",block:"start"});
 document.getElementById("saveCustomerEditBtn").onclick=()=>saveCustomerEdit(name);
 document.getElementById("cancelCustomerEditBtn").onclick=()=>form.classList.add("hidden");
}
function saveCustomerEdit(name){
 const map=allCustomerEntries();
 const entry=map.get(name);
 if(!entry)return;
 const newName=document.getElementById("editCustomerName").value.trim();
 if(!newName){alert(st('msg.enterCustomerName'));return}
 const newAddress=document.getElementById("editCustomerAddress").value.trim();
 const newPhone=document.getElementById("editCustomerPhone").value.trim();
 let rec=(state.customers||[]).find(c=>customerKey(c.name)===name);
 if(!rec){rec={id:uid(),name:newName,address:newAddress,phone:newPhone,notes:"",createdAt:new Date().toISOString()};state.customers=state.customers||[];state.customers.push(rec)}
 else{rec.name=newName;rec.address=newAddress;rec.phone=newPhone}
 entry.projects.forEach(p=>{p.customer=newName;if(newAddress)p.address=newAddress});
 currentCustomerName=newName;
 save();renderAll();
}
function deleteCustomer(name){
 const map=allCustomerEntries();
 const entry=map.get(name);
 if(!entry)return;
 const jobCount=entry.projects.length;
 if(!confirm(jobCount?st('msg.confirmDeleteCustomerAndJobs',[name,jobCount]):st('msg.confirmDeleteCustomer',[name])))return;
 state.customers=(state.customers||[]).filter(c=>customerKey(c.name)!==name);
 state.projects=(state.projects||[]).filter(p=>customerKey(p.customer)!==name);
 currentCustomerName=null;
 save();renderAll();
}
document.getElementById("customerSearch")?.addEventListener("input",e=>{customerSearchTerm=e.target.value;renderCustomers()});
document.getElementById("newCustomerBtn")?.addEventListener("click",openNewCustomerForm);
document.getElementById("customersJobsBtn")?.addEventListener("click",()=>{currentCustomerName=null;show("customers")});
function mergeMobileProject(incoming){if(!incoming?.id||!Array.isArray(incoming.cabinets))throw new Error("Invalid project");let base=state.projects.find(x=>x.id===incoming.id);if(!base){state.projects.unshift(incoming);return incoming}
["name","customer","address","phone","notes","siteMeasurements","sitePhotos","siteRoomName","siteRoomLocation","siteRoomNotes","geoLat","geoLng"].forEach(k=>{if(incoming[k]!==undefined)base[k]=incoming[k]});
base.rooms=base.rooms||[];(incoming.rooms||[]).forEach(ir=>{let br=base.rooms.find(x=>x.id===ir.id);if(!br){base.rooms.unshift(JSON.parse(JSON.stringify(ir)));return}Object.assign(br,JSON.parse(JSON.stringify(ir)))});
incoming.cabinets.forEach(ic=>{let bc=base.cabinets.find(x=>x.id===ic.id);if(!bc){base.cabinets.push(ic);return}ic.parts?.forEach(ip=>{let bp=bc.parts.find(x=>x.id===ip.id);if(!bp){bc.parts.push(ip);return}["status","installNote","locationNote","panelPhotos"].forEach(k=>{if(ip[k]!==undefined)bp[k]=ip[k]})})});return base}
async function importMobileUpdates(file){if(!file)return;try{const raw=jsonFromZip(await readZip(file)),incoming=ensureSharedProject(raw.project||raw);const merged=mergeMobileProject(incoming);state.currentProject=merged.id;state.currentCabinet=merged.cabinets[0]?.id||null;state.currentPart=null;save();renderAll();show("jobs");alert(st('msg.siteUpdatesImported'))}catch(e){alert(st('msg.notValidSiteUpdateZip'))}}
const DIRECT_SYNC_DB="assembleone_direct_sync_v1";
const DIRECT_SYNC_FALLBACK="assembleone_direct_sync_queue_v1";
function studioSyncDb(){return new Promise((resolve,reject)=>{const q=indexedDB.open(DIRECT_SYNC_DB,1);q.onupgradeneeded=()=>{const db=q.result;if(!db.objectStoreNames.contains("studioInbox"))db.createObjectStore("studioInbox",{keyPath:"syncId"})};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
function fallbackPackets(){try{return JSON.parse(localStorage.getItem(DIRECT_SYNC_FALLBACK)||"[]")||[]}catch(e){return []}}
async function studioInboxPackets(){let out=[];try{const cloud=await firebaseGet("studioInbox");if(cloud)out.push(...Object.values(cloud))}catch(e){console.error("Firebase Studio inbox read failed",e)}try{const db=await studioSyncDb();const tx=db.transaction("studioInbox","readonly"),req=tx.objectStore("studioInbox").getAll();out.push(...await new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error)}));db.close()}catch(e){}const map=new Map();[...out,...fallbackPackets()].forEach(x=>map.set(x.syncId||x.exportedAt||Math.random(),x));return [...map.values()].sort((a,b)=>String(a.exportedAt).localeCompare(String(b.exportedAt)))}
function inboxSummary(pack){const p=pack?.project||pack||{};const room=p.rooms?.find(r=>r.draft)||p.rooms?.[0]||{};const measures=(room.siteMarkup?.marks?.filter(x=>x.type==='measure').length||0)+(room.measureCaptures||[]).reduce((n,c)=>n+(c.marks||[]).filter(x=>x.type==='measure').length,0)||p.siteMeasurements?.length||0;const photos=(room.sitePhotos?.length||0)+(room.designImages?.length||0)+(room.beforePhotos?.length||0)+(room.measureCaptures?.length||0)+(p.sitePhotos?.length||0);return {syncId:pack?.syncId||pack?.exportedAt||'',customer:p.customer||st('common.customerNotNamed'),address:p.address||'',project:p.name||st('common.newSiteJob'),icon:room.icon||'📍',room:room.name||st('common.roomNotNamed'),floor:room.location||room.floor||'',measures,photos}}
function showInboxPopup(items){return}
async function paintSiteInbox(){const badge=document.getElementById('siteUpdateBadge'),panel=document.getElementById('directSiteInbox'),list=document.getElementById('siteJobsList'),cardBadge=document.getElementById('siteJobsCardBadge');try{const items=await studioInboxPackets();if(badge)badge.textContent=items.length?`${items.length} ${st('common.newBadge')}`:st('common.noNewJobsBadge');panel?.classList.toggle('inbox-ready',!!items.length);if(cardBadge){if(items.length){cardBadge.textContent=String(items.length);cardBadge.removeAttribute('hidden')}else{cardBadge.setAttribute('hidden','')}}if(!list)return;if(!items.length){list.innerHTML=`<div class="site-jobs-empty">${st('common.noNewSiteJobsList')}</div>`;return}list.innerHTML=items.map(pack=>{const syncId=pack.syncId||pack.exportedAt||'';let x;try{x=inboxSummary(pack)}catch(e){console.error('Unreadable site job packet',pack,e);return `<div class="site-job-inbox-broken"><span><strong>${st('common.jobCouldNotBeRead')}</strong><span class="site-project-name">${st('common.jobDataCorrupted')}</span></span><button type="button" class="btn danger" data-remove-site-packet="${safe(syncId)}">${st('common.remove')}</button></div>`}return `<div class="site-job-inbox-card2"><div class="site-job-inbox-top"><span class="site-job-room-icon">${x.icon}</span><span class="site-job-main"><strong>${safe(x.customer)}</strong>${x.address?`<span class="site-job-address">📍 ${safe(x.address)}</span>`:''}<span class="site-project-name">${safe(x.project)} · ${safe(x.room)}${x.floor?' · '+safe(x.floor):''}</span><span class="site-job-meta"><span>📷 ${x.photos}</span><span>📏 ${x.measures}</span></span></span><button type="button" class="site-job-remove-x" data-remove-site-packet="${safe(x.syncId)}" data-job-label="${safe(x.customer)} — ${safe(x.room)}" title="${st('common.removeWithoutOpening')}">✕</button></div><div class="site-job-inbox-actions"><button type="button" class="site-job-save-btn" data-save-site-packet="${safe(x.syncId)}" data-job-label="${safe(x.customer)}">${st('common.saveToCustomer')}</button><button type="button" class="site-job-open-full" data-open-site-packet="${safe(x.syncId)}">${st('common.openDrawingArrow')}</button></div></div>`}).join('');list.querySelectorAll('[data-open-site-packet]').forEach(b=>b.onclick=()=>receiveSitePacket(b.dataset.openSitePacket));list.querySelectorAll('[data-remove-site-packet]').forEach(b=>b.onclick=async(e)=>{e.stopPropagation();if(!confirm(st('msg.confirmDeleteWithoutSaving',[b.dataset.jobLabel])))return;await removeInboxPacket(b.dataset.removeSitePacket);await paintSiteInbox()});list.querySelectorAll('[data-save-site-packet]').forEach(b=>b.onclick=async(e)=>{e.stopPropagation();await saveSitePacketToCustomer(b.dataset.saveSitePacket)})}catch(e){console.error('Site inbox failed to load',e);if(badge)badge.textContent=st('common.useBackupFile');if(cardBadge)cardBadge.setAttribute('hidden','');if(list)list.innerHTML=`<div class="site-jobs-empty">${st('common.directSyncUnavailableUseBackup')}</div>`;document.querySelector('.site-file-backup')?.classList.add('visible')}}
async function saveSitePacketToCustomer(syncId){
 try{
  const packets=await studioInboxPackets();
  const pack=packets.find(x=>(x.syncId||x.exportedAt)===syncId);
  if(!pack)return alert(st('msg.siteJobNoLongerWaiting'));
  const incoming=ensureSharedProject(pack.project||pack);
  const merged=mergeMobileSiteJob(incoming);
  ensureSiteReferenceCabinet(merged);
  await removeInboxPacket(pack.syncId||pack.exportedAt);
  renderAll();save();
  await paintSiteInbox();
  alert(st('msg.savedToCustomerJobs',[merged.customer||'the customer']));
 }catch(e){
  console.error(e);
  alert(st('msg.couldNotSaveJobTryDrawing'));
 }
}
async function removeInboxPacket(syncId){try{await firebaseDelete(`studioInbox/${firebaseSafeKey(syncId)}`)}catch(e){console.error(e)}try{const db=await studioSyncDb();const tx=db.transaction('studioInbox','readwrite');tx.objectStore('studioInbox').delete(syncId);await new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});db.close()}catch(e){}const rest=fallbackPackets().filter(x=>(x.syncId||x.exportedAt)!==syncId);if(rest.length)localStorage.setItem(DIRECT_SYNC_FALLBACK,JSON.stringify(rest));else localStorage.removeItem(DIRECT_SYNC_FALLBACK)}
function ensureSiteReferenceCabinet(merged){
 const room=merged.rooms?.[0];
 // Note photos are reference material for the notes, not measurement/design
 // pictures -- excluded here so a photo taken alongside a note can never get
 // auto-picked as the cabinet's drawing the moment a site job is opened.
 // They're still visible (and still manually usable via "Use in Drawing")
 // in the site room details view.
 const pics=siteRoomPictures(room).filter(pic=>pic.label!=='Note photo');
 let c=merged.cabinets?.find(x=>x.roomId===room?.id);
 if(!c){c={id:uid(),name:(room?.name||'Site room')+' drawing',roomId:room?.id||'',drawing:null,drawingType:null,drawingName:'',parts:[]};merged.cabinets=merged.cabinets||[];merged.cabinets.push(c)}
 if(pics[0]&&(!c.drawing||c.siteReference)&&c.drawing!==pics[0].src){
  c.drawing=pics[0].src;c.drawingType='image';c.drawingName=(room?.name||'Site room')+' site measurements';c.siteReference=true;c.beforePicture=pics[0].src;
  const capture=(room?.measureCaptures||[]).find(cap=>cap.image===pics[0].src);
  const markupSource=room?.siteMarkup?.image===pics[0].src?room.siteMarkup:capture;
  c.siteMarkup=markupSource?JSON.parse(JSON.stringify({image:markupSource.image,w:markupSource.w,h:markupSource.h,marks:markupSource.marks||[]})):null;
 }
 return c;
}
async function receiveSitePacket(syncId){try{const packets=await studioInboxPackets();const pack=packets.find(x=>(x.syncId||x.exportedAt)===syncId)||packets[0];if(!pack)return alert(st('msg.siteJobNoLongerWaiting'));const incoming=ensureSharedProject(pack.project||pack);const merged=mergeMobileSiteJob(incoming);await removeInboxPacket(pack.syncId||pack.exportedAt);const c=ensureSiteReferenceCabinet(merged);state.currentProject=merged.id;state.currentCabinet=c.id;state.currentPart=null;renderAll();save();await paintSiteInbox();show('mark');alert(st('msg.siteJobOpenedDrawing'))}catch(e){console.error(e);alert(st('msg.directSyncNotAvailableBackup'));document.querySelector('.site-file-backup')?.classList.add('visible')}}
async function receiveSiteInbox(){const packets=await studioInboxPackets();if(!packets.length)return alert(st('msg.noNewSiteJobsWaiting'));return receiveSitePacket(packets[0].syncId||packets[0].exportedAt)}
document.getElementById('directSiteInbox')?.addEventListener('click',e=>{const card=e.target.closest('[data-open-site-packet]');if(card)receiveSitePacket(card.dataset.openSitePacket)});
document.getElementById('siteInboxImportNow')?.addEventListener('click',receiveSiteInbox);

document.getElementById('siteRoomDetailsClose')?.addEventListener('click',closeSiteRoomDetails);
document.getElementById('siteRoomDetailsModal')?.addEventListener('click',e=>{if(e.target.id==='siteRoomDetailsModal')closeSiteRoomDetails()});
document.getElementById('sitePhotoToDrawing')?.addEventListener('click',sendSitePhotoToDrawing);
document.getElementById('siteOpenProject')?.addEventListener('click',()=>{const m=document.getElementById('siteRoomDetailsModal');if(!m)return;state.currentProject=m.dataset.projectId;state.currentCabinet=project()?.cabinets?.[0]?.id||null;renderAll();save();closeSiteRoomDetails();show('jobs')});

document.getElementById('siteInboxLater')?.addEventListener('click',()=>document.getElementById('siteInboxModal')?.classList.remove('open'));
try{const syncChannel=new BroadcastChannel("assembleone-sync");syncChannel.onmessage=()=>paintSiteInbox()}catch(e){}
window.addEventListener('storage',e=>{if(e.key===DIRECT_SYNC_FALLBACK)paintSiteInbox()});
setInterval(paintSiteInbox,1800);setTimeout(paintSiteInbox,200);

async function openProjectPackage(file){if(!file)return;try{const raw=jsonFromZip(await readZip(file)),incoming=ensureSharedProject(raw.project||raw);if(!incoming?.id||!Array.isArray(incoming.cabinets))throw new Error();const i=state.projects.findIndex(x=>x.id===incoming.id);if(i>=0)state.projects[i]=incoming;else state.projects.unshift(incoming);state.currentProject=incoming.id;state.currentCabinet=incoming.cabinets[0]?.id||null;state.currentPart=null;save();renderAll();show("jobs");alert(st('msg.projectOpenedInStudio'))}catch(e){alert(st('msg.notValidProjectZip'))}}
if($("#reviewBomBtn"))$("#reviewBomBtn").onclick=()=>show("bom");if($("#refreshBomBtn"))$("#refreshBomBtn").onclick=()=>{renderAll();renderJobBom();};
$("#importMobileInput").onchange=e=>{const f=e.target.files[0];const badge=document.getElementById('siteUpdateBadge');if(f&&badge)badge.textContent='Importing…';importMobileUpdates(f);setTimeout(()=>{if(badge)badge.textContent='Site updates imported ✓'},300);e.target.value=""};
$("#openProjectInput").onchange=e=>{openProjectPackage(e.target.files[0]);e.target.value=""};
(function(){
 // Lets a job card dragged out to the desktop/another app (see the folder-card
 // dragstart wiring in renderJobs) be dragged straight back in to resume it --
 // wired once here rather than inside renderJobs, since #jobGrid itself is not
 // recreated on every render (only its children are).
 const jobGrid=document.getElementById("jobGrid");
 if(!jobGrid)return;
 const hasFile=dt=>{try{return [...(dt?.types||[])].includes("Files")}catch(e){return !!dt?.files?.length}};
 jobGrid.addEventListener("dragover",e=>{if(hasFile(e.dataTransfer)){e.preventDefault();jobGrid.classList.add("drag-ready")}});
 jobGrid.addEventListener("dragleave",e=>{if(!jobGrid.contains(e.relatedTarget))jobGrid.classList.remove("drag-ready")});
 jobGrid.addEventListener("drop",e=>{
  if(!hasFile(e.dataTransfer))return;
  e.preventDefault();jobGrid.classList.remove("drag-ready");
  const file=[...(e.dataTransfer.files||[])].find(f=>/\.zip$/i.test(f.name));
  if(file)openProjectPackage(file);else alert(st('msg.dropZipToReopen'));
 });
})();
$("#deleteJobBtn").onclick=()=>{const p=project();if(p&&confirm(deleteJobConfirmMessage(p))){state.projects=state.projects.filter(x=>x.id!==p.id);state.currentProject=null;state.currentCabinet=null;state.currentPart=null;save();renderAll();show("jobs")}};
$("#cabinetSelect").onchange=e=>{state.currentCabinet=e.target.value;state.currentPart=null;save();renderAll()};
const partNamePicker=$("#partNamePicker");
if(partNamePicker){
  const storeTypedPartName=()=>{
    const name=partNamePicker.value.trim();
    if(!name)return;
    state.lastChosenPartName=name;
    const p=part();
    if(p)p.name=name;
    if($("#chosenPartSummary"))$("#chosenPartSummary").textContent=name;
    save();
  };
  partNamePicker.addEventListener("input",storeTypedPartName);
  partNamePicker.addEventListener("change",()=>{
    storeTypedPartName();
    const d=partNamePicker.closest("details");
    if(d)d.open=false;
    renderAll();
  });
  partNamePicker.addEventListener("keydown",e=>{
    if(e.key==="Enter"){
      e.preventDefault();
      storeTypedPartName();
      const d=partNamePicker.closest("details");
      if(d)d.open=false;
      partNamePicker.blur();
      renderAll();
    }
  });
}
$$("[data-name]").forEach(b=>b.onclick=()=>setPartName(b.dataset.name));

const materialCustomInput=$("#materialCustomInput");
const saveMaterialBtn=$("#saveMaterialBtn");
function saveTypedMaterial(){
 const name=(materialCustomInput?.value||"").trim();
 if(!name)return;
 chooseMaterial(name);
 if(materialCustomInput)materialCustomInput.value="";
 closeMaterialPicker();
}

if(saveMaterialBtn)saveMaterialBtn.addEventListener("click",saveTypedMaterial);
if(materialCustomInput){
 materialCustomInput.addEventListener("keydown",e=>{
   if(e.key!=="Enter")return;
   e.preventDefault();
   saveTypedMaterial();
 });
}

const notesCustomInput=$("#notesCustomInput");
if(notesCustomInput){
 notesCustomInput.addEventListener("keydown",e=>{
   if(e.key!=="Enter")return;
   e.preventDefault();
   const name=notesCustomInput.value.trim();
   if(name){choosePanelNote(name);notesCustomInput.value=""}
 });
 notesCustomInput.addEventListener("change",()=>{
   const name=notesCustomInput.value.trim();
   if(name){choosePanelNote(name);notesCustomInput.value=""}
 });
}
function drawingFileAllowed(file){
 if(!file)return false;
 const type=(file.type||"").toLowerCase();
 const name=(file.name||"").toLowerCase();
 if(type.startsWith("image/")||type==="application/pdf")return true;
 if(/\.(png|jpe?g|jfif|webp|gif|bmp|svg|pdf|heic|heif|tiff?|ico|avif)$/i.test(name))return true;
 if(!type&&!/\.[a-z0-9]+$/i.test(name))return true;
 return false;
}
function ensureRoomsWorkspace(){
 let p=project();
 if(!p){
   p={id:uid(),name:"New Job",customer:"",rooms:[],cabinets:[]};
   state.projects.unshift(p);state.currentProject=p.id;
 }
 let c=cabinet();
 if(!c){
   c={id:uid(),name:"Wardrobe 1",drawing:null,drawingType:null,drawingName:"",parts:[]};
   p.cabinets.push(c);state.currentCabinet=c.id;
 }
 return c;
}
function showRoomsMessage(message,isError=false){
 const empty=$("#drawingEmpty");
 if(!empty)return;
 empty.innerHTML=`<strong>${isError?st('common.couldNotAddDrawing'):st('common.roomsArea')}</strong><br>${safe(message)}`;
 empty.style.display="block";
}
function readFileAsDataUrl(file){
 return new Promise((resolve,reject)=>{
   const reader=new FileReader();
   reader.onerror=()=>reject(new Error(st('common.selectedFileCouldNotBeRead')));
   reader.onabort=()=>reject(new Error(st('common.openingFileCancelled')));
   reader.onload=()=>resolve(String(reader.result||""));
   reader.readAsDataURL(file);
 });
}
async function importRoomsFile(file){
 if(!file)return;
 if(!drawingFileAllowed(file)){
   alert(st('msg.choosePictureScreenshotPdf'));
   return;
 }
 const c=ensureRoomsWorkspace();
 const stage=$("#drawingStage");
 stage.classList.add("importing");
 showRoomsMessage(st('common.openingFileEllipsis')+(file.name||st('common.photoOrScreenshotFallback'))+"…");
 try{
   const data=await readFileAsDataUrl(file);
   if(!data)throw new Error(st('common.fileWasEmpty'));
   const isPdf=(file.type||"").toLowerCase()==="application/pdf"||/\.pdf$/i.test(file.name||"");
   c.drawing=data;
   c.drawingType=isPdf?"pdf":"image";
   c.drawingName=file.name||"Photo or screenshot";
   stage.classList.remove("importing");
   state.screen="mark";
   renderAll();
   const stored=save();
   if(!stored){
     setTimeout(()=>alert(st('msg.drawingTooLargeStorage')),50);
   }
 }catch(err){
   stage.classList.remove("importing");
   console.error(err);
   showRoomsMessage(err.message||st('common.tryAnotherPictureScreenshot'),true);
   alert(err.message||st('msg.drawingCouldNotOpen'));
 }
}
function firstDroppedFile(dt){
 if(!dt)return null;
 const files=Array.from(dt.files||[]);
 for(const file of files)if(drawingFileAllowed(file))return file;
 for(const item of Array.from(dt.items||[])){
   if(item.kind==="file"){
     const file=item.getAsFile();
     if(file&&drawingFileAllowed(file))return file;
   }
 }
 if(files.length)return files[0];
 return null;
}
["drawingInputTop","drawingPhotoInput"].forEach(id=>{
 const input=$("#"+id);
 if(input)input.addEventListener("change",async e=>{
   const file=e.target.files&&e.target.files[0];
   await importRoomsFile(file);
   e.target.value="";
 });
});
async function pasteDrawingFromClipboard(){
 const stage=$("#drawingStage");
 stage.focus();
 showRoomsMessage(st('common.checkingClipboardForDrawing'));
 try{
   if(navigator.clipboard&&navigator.clipboard.read){
     const clipboardItems=await navigator.clipboard.read();
     for(const clipboardItem of clipboardItems){
       const imageType=(clipboardItem.types||[]).find(type=>String(type).startsWith("image/"));
       if(!imageType)continue;
       const blob=await clipboardItem.getType(imageType);
       const extension=(imageType.split("/")[1]||"png").replace("jpeg","jpg");
       const file=new File([blob],"Pasted drawing."+extension,{type:imageType});
       await importRoomsFile(file);
       showRoomsMessage(st('common.drawingPastedFromClipboard'));
       return;
     }
   }
 }catch(err){
   console.warn("Direct clipboard paste was not available",err);
 }
 showRoomsMessage(st('common.copyDrawingThenPasteHint'));
 stage.classList.add("paste-ready");
 setTimeout(()=>stage.classList.remove("paste-ready"),5000);
}
$("#pasteScreenshotBtn").onclick=pasteDrawingFromClipboard;
document.addEventListener("paste",e=>{
 const items=Array.from((e.clipboardData&&e.clipboardData.items)||[]);
 const item=items.find(x=>x.kind==="file"&&String(x.type||"").startsWith("image/"));
 if(item){
   e.preventDefault();
   $("#drawingStage").classList.remove("paste-ready");
   importRoomsFile(item.getAsFile());
   return;
 }
 const files=Array.from((e.clipboardData&&e.clipboardData.files)||[]);
 const imageFile=files.find(file=>String(file.type||"").startsWith("image/"));
 if(imageFile){
   e.preventDefault();
   $("#drawingStage").classList.remove("paste-ready");
   importRoomsFile(imageFile);
 }
});
const drop=$("#drawingStage");
["dragenter","dragover"].forEach(type=>drop.addEventListener(type,e=>{
 e.preventDefault();e.stopPropagation();
 drop.classList.add("drag-over");
 if(e.dataTransfer)e.dataTransfer.dropEffect="copy";
}));
["dragleave","dragend"].forEach(type=>drop.addEventListener(type,e=>{
 e.preventDefault();e.stopPropagation();
 if(type==="dragend"||!drop.contains(e.relatedTarget))drop.classList.remove("drag-over");
}));
drop.addEventListener("drop",e=>{
 e.preventDefault();e.stopPropagation();drop.classList.remove("drag-over");
 const file=firstDroppedFile(e.dataTransfer);
 if(file)importRoomsFile(file);
 else alert(st('msg.notPictureFileTryDragging'));
});
document.addEventListener("dragover",e=>e.preventDefault());
document.addEventListener("drop",e=>{if(!drop.contains(e.target))e.preventDefault()});
drop.addEventListener("click",e=>{
 if(e.target.closest(".pin"))return;
 const c=cabinet();
 if(!c?.drawing){$("#drawingInputTop").click();return}
 if(c.drawingType==="pdf")return alert(st('msg.forMarkingPanelsUsePngJpg'));
 const r=$("#drawingCanvas").getBoundingClientRect();
 createPartAt((e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100);
});
function setRoomsZoom(value,keepCentre=true){
 const stage=$("#drawingStage");
 const old=Math.max(.25,Number(state.drawingZoom||1));
 const cx=stage.scrollLeft+stage.clientWidth/2,cy=stage.scrollTop+stage.clientHeight/2;
 state.drawingZoom=Math.max(.25,Math.min(4,Math.round(value*4)/4));
 renderRooms();
 if(keepCentre){const ratio=state.drawingZoom/old;requestAnimationFrame(()=>stage.scrollTo({left:Math.max(0,cx*ratio-stage.clientWidth/2),top:Math.max(0,cy*ratio-stage.clientHeight/2)}))}
}
$("#zoomInBtn").onclick=e=>{e.stopPropagation();setRoomsZoom(Number(state.drawingZoom||1)+0.25)};
$("#zoomOutBtn").onclick=e=>{e.stopPropagation();setRoomsZoom(Number(state.drawingZoom||1)-0.25)};
$("#zoomFitBtn").onclick=e=>{e.stopPropagation();state.drawingZoom=1;renderRooms();$("#drawingStage").scrollTo({left:0,top:0,behavior:"smooth"})};
$("#drawingStage").addEventListener("wheel",e=>{if(!e.ctrlKey)return;e.preventDefault();setRoomsZoom(Number(state.drawingZoom||1)+(e.deltaY<0?0.25:-0.25))},{passive:false});
$("#drawingStage").addEventListener("dblclick",e=>{if(e.target.closest(".pin"))return;$("#drawingStage").classList.toggle("expanded");setTimeout(renderRooms,20)});
$("#drawingStage").addEventListener("scroll",()=>{const c=cabinet();if(!c)return;c.viewState=c.viewState||{};c.viewState.scrollLeft=$("#drawingStage").scrollLeft;c.viewState.scrollTop=$("#drawingStage").scrollTop;c.viewState.zoom=Number(state.drawingZoom||1);clearTimeout(window.__a112ScrollSave);window.__a112ScrollSave=setTimeout(save,180)},{passive:true});
window.addEventListener("resize",()=>{if(state.screen==="mark")renderRooms()});

$("#saveNextBtn").onclick=()=>{
 const mi=$("#materialCustomInput");
 if(mi&&mi.value.trim())saveTypedMaterial();
 const p=part();if(!p)return;
 const c=cabinet(),pr=project(),stage=$("#drawingStage");
 // Always keep the active project material on the saved panel.
 const activeMaterial=String(p.material||pr?.defaultMaterial||c?.lastMaterial||"").trim();
 if(activeMaterial){p.material=activeMaterial;if(c)c.lastMaterial=activeMaterial;if(pr)pr.defaultMaterial=activeMaterial;storeMaterialName(activeMaterial)}
 if(c){c.viewState=c.viewState||{};c.viewState.zoom=Number(state.drawingZoom||1);c.viewState.scrollLeft=stage?.scrollLeft||0;c.viewState.scrollTop=stage?.scrollTop||0;if(p.thickness!==""&&p.thickness!=null){c.lastThickness=Number(p.thickness)||getDefaultThicknessMM();setDefaultThicknessMM(c.lastThickness)}}
 closeMaterialPicker();closeNotesPicker();
 const keepCabinet=state.currentCabinet;
 state.currentPart=null;
 save();renderAll();state.currentCabinet=keepCabinet;show("mark");
 requestAnimationFrame(()=>{renderMaterialPicker();closeMaterialPicker();closeNotesPicker();renderRooms()});
 setTimeout(()=>{renderMaterialPicker();closeMaterialPicker();closeNotesPicker()},40);
};

$("#deletePartBtn").onclick=()=>{const c=cabinet(),p=part();if(c&&p&&confirm(st('msg.confirmDeletePanel',[p.code]))){c.parts=c.parts.filter(x=>x.id!==p.id);c.parts.forEach((x,i)=>x.code=`P-${String(i+1).padStart(3,"0")}`);state.currentPart=null;save();renderAll()}};
$("#downloadCsvBtn").onclick=()=>{const c=cabinet(),complete=supplierParts();if(!complete.length){alert(st('msg.noCompletePartsReady'));return}const rows=[["Panel No.","Thickness","Length","Long edge lines","Width","Short edge lines","Qty","Material"],...complete.map(p=>[p.code,p.thickness,p.length,p.edgeLong||0,p.width,p.edgeShort||0,p.qty,materialForPanel(p)||""])];const csv=rows.map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=((project()?.name||"Job")+"_"+(c?.name||"Wardrobe")).replace(/[^\w-]+/g,"_")+"_cutting_list.csv";a.click()};
$("#printCuttingBtn").onclick=()=>{$$(".screen").forEach(x=>x.classList.remove("print-target"));$("#screen-cutting").classList.add("print-target");window.print()};
$("#generateQrBtn").onclick=renderQr;$("#printQrBtn").onclick=()=>{$$(".screen").forEach(x=>x.classList.remove("print-target"));$("#screen-qr").classList.add("print-target");window.print()};
$("#phonePartSelect").onchange=e=>{state.currentPart=e.target.value;save();renderPhone()};

function updateEdgePreview(){
 const p=part(),length=$("#fLength").value||p?.length||"2400",width=$("#fWidth").value||p?.width||"600",thick=$("#fThickness").value||p?.thickness||"19";
 if($("#edgeThickness")) $("#edgeThickness").textContent=thick+" "+unitLabel(currentMeasureUnit());
 if($("#lengthEdgeText")) $("#lengthEdgeText").textContent=length;
 if($("#widthEdgeText")) $("#widthEdgeText").textContent=width;
 const lw=$("#lengthMeasureWrap"),ww=$("#widthMeasureWrap");
 if(lw) lw.className="measure-wrap "+(Number(p?.edgeLong||0)===1?"edge-one":Number(p?.edgeLong||0)===2?"edge-two":"");
 if(ww) ww.className="measure-wrap "+(Number(p?.edgeShort||0)===1?"edge-one":Number(p?.edgeShort||0)===2?"edge-two":"");
}
$("#lengthEdgeBtn").onclick=()=>{const p=part();if(!p)return;p.edgeLong=(Number(p.edgeLong||0)+1)%3;save();updateEdgePreview();renderCutting()};
$("#widthEdgeBtn").onclick=()=>{const p=part();if(!p)return;p.edgeShort=(Number(p.edgeShort||0)+1)%3;save();updateEdgePreview();renderCutting()};
["fLength","fWidth","fThickness"].forEach(id=>$("#"+id).addEventListener("input",updateEdgePreview));
function cycleMeasurementEdge(kind,e){
 if(e){e.preventDefault();e.stopPropagation()}
 const p=part();if(!p)return alert(st('msg.markOrSelectPanelFirst'));
 const key=kind==="length"?"edgeLong":"edgeShort";
 p[key]=(Number(p[key]||0)+1)%3;
 save();updateEdgePreview();renderCutting();
}
[["fLength","lengthMeasureWrap","length"],["fWidth","widthMeasureWrap","width"]].forEach(([inputId,wrapId,kind])=>{
 const input=$("#"+inputId),wrap=$("#"+wrapId),field=wrap?.closest(".measure-field");
 const handle=e=>cycleMeasurementEdge(kind,e);
 if(input) input.addEventListener("dblclick",handle,true);
 if(wrap) wrap.addEventListener("dblclick",e=>{if(e.target===input)return;handle(e)},true);
 if(field) field.addEventListener("dblclick",e=>{if(e.target.closest("#"+wrapId))return;handle(e)},true);
});
$$('[data-quick-menu]').forEach(b=>b.onclick=e=>{e.stopPropagation();const menu=$("#quick-"+b.dataset.quickMenu);$$('.quick-pop').forEach(x=>{if(x!==menu)x.classList.remove('open')});menu.classList.toggle('open')});
$$('[data-quick-name]').forEach(b=>b.onclick=e=>{e.stopPropagation();setPartName(b.dataset.quickName);$$('.quick-pop').forEach(x=>x.classList.remove('open'));const lib=b.closest('.common-part-library');if(lib)lib.open=false;const chosen=document.querySelector('.chosen-parts');if(chosen)chosen.open=false;});
document.addEventListener('click',()=>$$('.quick-pop').forEach(x=>x.classList.remove('open')));
$$("[data-template]").forEach(b=>b.onclick=()=>{const p=part();if(!p)return alert(st('msg.markPanelFirst'));p.name=b.dataset.template;if($("#partNamePicker")) $("#partNamePicker").value=b.dataset.template;save();renderAll()});
$("#addSameMarkerBtn").onclick=()=>{const p=part();if(!p)return alert(st('msg.choosePanelFirst'));p.copies=p.copies||[];p.copies.push({x:Math.min(94,(p.x||50)+5),y:Math.min(94,(p.y||50)+5),status:"ready"});p.qty=Math.max(Number(p.qty||1),1+p.copies.length);state.selectedCopy=p.copies.length-1;save();renderAll();const d=document.querySelector(".panel-options");if(d)d.open=false;alert(st('msg.samePartNumberAdded'))};
$("#addAllMarkersBtn").onclick=()=>{
 const p=part();if(!p)return alert(st('msg.choosePanelFirst'));
 p.copies=p.copies||[];
 const target=Math.max(1,Number(p.qty)||1);
 const have=1+p.copies.length;
 const need=target-have;
 if(need<=0)return alert(have>1?st('msg.allMarkersAlreadyOnDrawing',[target]):st('msg.setQuantityFirst'));
 for(let n=have;n<target;n++){
   const col=n%4,row=Math.floor(n/4);
   const x=Math.min(94,Math.max(2,(p.x||50)+6+col*7));
   const y=Math.min(94,Math.max(2,(p.y||50)+6+row*7));
   p.copies.push({x,y,status:"ready"});
 }
 state.selectedCopy=p.copies.length-1;
 save();renderAll();
 const d=document.querySelector(".panel-options");if(d)d.open=false;
 alert(st('msg.addedMoreMarkers',[need,target]));
};
$("#makeUniqueBtn").onclick=()=>{const c=cabinet(),p=part(),i=Number(state.selectedCopy);if(!c||!p||i<0||!p.copies?.[i])return alert(st('msg.selectRepeatedMarkerFirst'));const pos=p.copies.splice(i,1)[0];const copy=JSON.parse(JSON.stringify(p));copy.id=uid();copy.code=nextCode(c);copy.qty=1;copy.x=pos.x;copy.y=pos.y;copy.status=pos.status||"ready";copy.copies=[];c.parts.push(copy);p.qty=Math.max(1,1+p.copies.length);state.currentPart=copy.id;state.selectedCopy=-1;save();renderAll();const d=document.querySelector(".panel-options");if(d)d.open=false};


function buildCuttingPrint(){
 const p=project(),c=cabinet();
 cabinetParts().forEach(x=>{const m=materialForPanel(x);if(m&&!x.material)x.material=m});
 const rows=supplierParts();
 const el=$("#cuttingPrintArea");
 if(!p||!c){el.innerHTML=`<p>${st('common.noWardrobeSelected')}</p>`;return}
 if(!rows.length){el.innerHTML=`<p>${st('common.noCompletePartsReadySupplier')}</p>`;return}
 el.innerHTML=`<div class="cutlist-title">
   <div><h2>${safe(p.name)} — ${safe(c.name)}</h2><div>${safe(p.customer||"")}</div></div>
   <div class="meta">${new Date().toLocaleDateString()}<br>${st('common.partTypeCount',[rows.length])}</div>
 </div>
 <table class="compact-cut-table">
  <thead><tr><th>${st('common.partNoHeader')}</th><th>${st('common.panelDetailsHeader')}</th><th>${st('common.descWhereGoesHeader')}</th><th class="qty">${st('common.qty')}</th></tr></thead>
  <tbody>${rows.map(x=>`<tr>
   <td class="partno">${safe(x.code)}</td>
   <td class="details">${panelDetailsHtml(x)}</td>
   <td>${safe(x.name||st('common.unnamedPart'))}<div class="material-small"><strong>${st('common.material')}</strong> ${safe(materialForPanel(x)||st('common.notSet'))}</div>${x.notes?`<div class="material-small">${safe(x.notes)}</div>`:""}</td>
   <td class="qty">${safe(x.qty||1)}</td>
  </tr>`).join("")}</tbody>
 </table>`;
}
function currentStickerSize(){
 const width=Math.max(20,Math.min(300,Number($("#stickerWidth")?.value)||70));
 const height=Math.max(20,Math.min(300,Number($("#stickerHeight")?.value)||50));
 return {width,height};
}
function qrSizeForSticker(width,height){return Math.max(44,Math.min(150,Math.round(Math.min(width,height)*1.35)))}
function buildStickerPrint(){
 const p=project(),c=cabinet(),rows=cabinetParts(),dims=currentStickerSize();
 const el=$("#stickerPrintArea");
 if(!p||!c){el.innerHTML=`<p>${st('common.noWardrobeSelected')}</p>`;return}
 if(!rows.length){el.innerHTML=`<p>${st('common.noCompletePartsReadySupplier')}</p>`;return}
 const textRight=dims.width<=55?38:dims.width>=90?31:34;
 const partSize=Math.max(14,Math.min(34,Math.round(dims.height*.46)));
 const descSize=Math.max(8,Math.min(20,Math.round(dims.height*.28)));
 const detailSize=Math.max(7,Math.min(17,Math.round(dims.height*.22)));
 el.innerHTML=`<div class="sticker-sheet">${rows.map(x=>`<article class="panel-sticker-v11" style="width:${dims.width}mm;height:${dims.height}mm">
   <div class="st-text" style="right:${textRight}%">
     <div class="st-top">
       <div class="st-part" style="font-size:${partSize}px">${safe(x.code)}</div>
       <div class="st-qty">${st('common.qty')} ${safe(x.qty||1)}</div>
     </div>
     <div class="st-desc" style="font-size:${descSize}px">${safe(x.name||st('common.unnamedPart'))}</div>
     <div class="st-details" style="font-size:${detailSize}px">${panelDetailsHtml(x)}</div>
   </div>
   <div id="printstqr-${x.id}" class="st-qr"></div>
 </article>`).join("")}</div>`;
 setTimeout(()=>rows.forEach(x=>makeQr(document.getElementById("printstqr-"+x.id),phoneQrText(x),qrSizeForSticker(dims.width,dims.height))),0);
}
function buildInstallPrint(){
 const p=project();
 const el=$("#installPrintArea");
 if(!p){el.innerHTML=`<p>${st('common.noProjectSelected')}</p>`;return}
 el.innerHTML=p.cabinets.map(c=>`<section class="install-project">
   <div class="install-head"><div><h2>${safe(p.name)}</h2><h3>${safe(c.name)}</h3></div><div>${safe(p.customer||"")}</div></div>
   <div class="install-drawing" id="installdrawing-${c.id}">${c.drawing&&c.drawingType!=="pdf"?`<img src="${c.drawing}">`:`<div>${st('common.noImageDrawingAvailable')}</div>`}</div>
   <table class="install-table"><thead><tr><th>${st('common.partHeader')}</th><th>${st('common.descriptionHeader')}</th><th>${st('common.qty')}</th><th>${st('common.statusHeaderPlain')}</th></tr></thead>
   <tbody>${c.parts.map(x=>`<tr><td><strong>${safe(x.code)}</strong></td><td>${safe(x.name||st('common.unnamedPart'))}</td><td>${safe(x.qty||1)}</td><td>${safe(statuses().find(s=>s[0]===x.status)?.[1]||st('status.ready'))}</td></tr>`).join("")}</tbody></table>
 </section>`).join("");
 setTimeout(()=>p.cabinets.forEach(c=>{
   const stage=document.getElementById("installdrawing-"+c.id);if(!stage)return;
   c.parts.forEach(x=>[{x:x.x,y:x.y},...(x.copies||[])].forEach(m=>{
      const d=document.createElement("div");d.className="install-pin";d.textContent=x.code.replace("P-","");d.style.left=m.x+"%";d.style.top=m.y+"%";stage.appendChild(d)
   }))
 }),0);
}
function doPrint(mode){
 buildCuttingPrint();buildStickerPrint();buildInstallPrint();
 document.body.classList.remove("print-cutting","print-stickers","print-install");
 document.body.classList.add(mode);
 setTimeout(()=>{window.print();setTimeout(()=>document.body.classList.remove(mode),300)},180);
}
if($("#printCuttingBtn"))$("#printCuttingBtn").onclick=()=>doPrint("print-cutting");
if($("#printStickersBtn"))$("#printStickersBtn").onclick=()=>doPrint("print-stickers");
if($("#printInstallPackBtn"))$("#printInstallPackBtn").onclick=()=>doPrint("print-install");
function refreshStickerSize(){renderCutting();buildStickerPrint()}
[$("#stickerWidth"),$("#stickerHeight")].forEach(el=>{if(el)el.oninput=refreshStickerSize});
$$(".sticker-preset").forEach(b=>b.onclick=()=>{$("#stickerWidth").value=b.dataset.w;$("#stickerHeight").value=b.dataset.h;refreshStickerSize()});
let qrReturnScroll=0;
function openGuidePreviewForPanel(p){
 const modal=$("#guidePreviewModal"),frame=$("#guidePreviewFrame"),c=cabinet(),pr=project();if(!modal||!frame||!p)return;
 qrReturnScroll=window.scrollY||0;
 const drawing=c?.drawing&&c.drawingType!=="pdf"?`<div class="drawing"><img src="${c.drawing}" alt="Highlighted panel drawing"><div class="highlight" style="left:${Number(p.x||50)}%;top:${Number(p.y||50)}%"><span>${safe(p.code)}</span></div></div>`:`<div class="missing">Drawing missing</div>`;
 frame.removeAttribute("src");
 frame.srcdoc=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:Arial,sans-serif;color:#272249;background:#f6f6f9}.wrap{padding:18px}.drawing{position:relative;background:#e9e5df;border-radius:18px;overflow:hidden;min-height:300px;display:grid;place-items:center}.drawing img{display:block;max-width:100%;max-height:68vh}.highlight{position:absolute;transform:translate(-50%,-50%);width:78px;height:78px;border:7px solid #4c9138;border-radius:50%;background:rgba(76,145,56,.22);display:grid;place-items:center}.highlight span{background:#4c9138;color:#fff;border-radius:999px;padding:8px;font-weight:800}.card{background:#fff;border-radius:18px;padding:18px;margin-top:14px}.card h1{margin:0 0 10px;font-size:28px}.row{font-size:20px;margin:7px 0}.muted{color:#665f75}.missing{padding:50px;text-align:center}.back{display:block;width:100%;padding:16px;border:0;border-radius:14px;background:#ffc400;color:#272249;font-size:20px;font-weight:800;margin-top:14px}</style>
<style id="siteRoomDetailsStyles">
.site-room-modal{position:fixed;inset:0;background:rgba(24,20,45,.72);z-index:10050;display:none;align-items:center;justify-content:center;padding:18px}.site-room-modal.open{display:flex}.site-room-dialog{width:min(1180px,96vw);max-height:92vh;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 28px 80px rgba(20,17,42,.35);display:flex;flex-direction:column}.site-room-head{display:flex;align-items:center;gap:14px;padding:18px 22px;border-bottom:2px solid #eceaf2}.site-room-head .room-badge{font-size:42px}.site-room-head h2{margin:0;font-size:30px}.site-room-head p{margin:4px 0 0;color:#6d687d;font-weight:700}.site-room-close{margin-left:auto;width:50px;height:50px;border-radius:15px;border:2px solid #ddd9e8;background:#fff;font-size:30px;cursor:pointer}.site-room-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,.9fr);min-height:560px;overflow:auto}.site-reference-pane{padding:18px;border-right:2px solid #eceaf2;background:#f8f9fc}.site-reference-frame{background:#e9ebf1;border-radius:20px;min-height:420px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}.site-reference-frame img{max-width:100%;max-height:62vh;object-fit:contain}.site-reference-empty{font-size:24px;color:#777286;text-align:center;padding:30px}.site-thumb-row{display:flex;gap:10px;overflow:auto;padding-top:12px}.site-thumb{width:86px;height:68px;border:3px solid transparent;border-radius:12px;object-fit:cover;cursor:pointer;background:#eee}.site-thumb.active{border-color:#f1b900}.site-design-pane{padding:22px;display:flex;flex-direction:column;gap:15px}.site-facts{display:grid;grid-template-columns:1fr 1fr;gap:12px}.site-fact{border:2px solid #e4e1eb;border-radius:18px;padding:14px;background:#fff}.site-fact b{display:block;font-size:25px;color:#2d2854}.site-fact span{color:#6c677d;font-weight:750}.site-notes-box{border:2px solid #e4e1eb;border-radius:18px;padding:15px;min-height:90px}.site-notes-box h3{margin:0 0 8px;font-size:19px}.site-detail-actions{display:grid;gap:12px;margin-top:auto}.site-detail-actions .btn{min-height:60px;font-size:19px;border-radius:16px}.site-detail-actions .primary{background:#ffc400;color:#29234f;border-color:#dda900}.site-drawing-placeholder{border:3px dashed #cfcbd9;border-radius:22px;min-height:190px;display:flex;align-items:center;justify-content:center;text-align:center;color:#716c80;font-weight:800;font-size:20px;padding:25px}.site-job-tag{display:inline-flex;align-items:center;gap:8px;background:#eaf8ef;color:#12783c;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900;margin-top:7px}.folder-card.site-received{border-color:#31a65d;background:#f4fbf6}.folder-card .site-details-btn{border-color:#456fc4;background:#f3f6ff}
@media(max-width:760px){.site-room-modal{padding:7px}.site-room-dialog{width:100%;max-height:96vh;border-radius:20px}.site-room-body{grid-template-columns:1fr}.site-reference-pane{border-right:0;border-bottom:2px solid #eceaf2}.site-reference-frame{min-height:260px}.site-facts{grid-template-columns:1fr 1fr}.site-room-head h2{font-size:23px}}
</style>



<style id="v123-illustrated-homepage">
.v12-home{background:linear-gradient(180deg,#fff 0%,#fbfbfe 100%);padding:24px!important}
.v12-home-header{margin-bottom:18px}
.v12-home-header h2{font-size:34px;color:#171c46;letter-spacing:-.4px}
.v12-home-header p{font-size:17px;color:#666b84}
.v12-main-actions{gap:20px;margin-bottom:22px}
.v12-action-card.illustrated-card{min-height:210px;padding:0 24px 0 0;grid-template-columns:300px 1fr auto;gap:22px;overflow:hidden;border-width:2px;box-shadow:0 10px 28px rgba(39,42,84,.08)}
.v12-action-card.illustrated-card .v123-card-art{width:300px;height:210px;object-fit:cover;object-position:center;display:block;align-self:stretch;border-radius:20px 0 0 20px}
.v12-action-card.illustrated-card .v123-card-copy{align-self:center}
.v12-action-card.illustrated-card strong{font-size:29px;line-height:1.08;letter-spacing:-.3px}
.v12-action-card.illustrated-card small{font-size:18px;line-height:1.45;margin-top:12px;max-width:330px}
.v12-action-card.illustrated-card>b{font-size:48px}
.v12-green{background:#f5fff7;border-color:#9bddae}.v12-green strong,.v12-green>b{color:#089538}
.v12-blue{background:#f4f8ff;border-color:#9dbdff}.v12-blue strong,.v12-blue>b{color:#145ad4}
.v12-orange{background:#fff9f1;border-color:#ffc57a}.v12-orange strong,.v12-orange>b{color:#f06a00}
.v12-purple{background:#faf6ff;border-color:#c9a9ff}.v12-purple strong,.v12-purple>b{color:#6a2bd4}
.v12-site-jobs,.v12-recent-section{border-radius:24px;box-shadow:0 8px 24px rgba(39,42,84,.07)}
.site-jobs-cloud{font-size:34px;width:58px;height:58px;display:grid;place-items:center;border-radius:16px;background:linear-gradient(145deg,#3d7cff,#76a6ff);color:#fff;box-shadow:0 8px 18px rgba(61,124,255,.25)}
.v12-section-heading h3{font-size:25px;color:#171c46}
.v12-section-heading p{font-size:15px}
@media(max-width:1200px){.v12-action-card.illustrated-card{grid-template-columns:220px 1fr auto;min-height:175px}.v12-action-card.illustrated-card .v123-card-art{width:220px;height:175px}.v12-action-card.illustrated-card strong{font-size:24px}.v12-action-card.illustrated-card small{font-size:15px}}
@media(max-width:820px){.v12-action-card.illustrated-card{grid-template-columns:145px 1fr auto;min-height:140px}.v12-action-card.illustrated-card .v123-card-art{width:145px;height:140px}.v12-action-card.illustrated-card strong{font-size:21px}.v12-action-card.illustrated-card small{font-size:14px;margin-top:7px}}
@media(max-width:520px){.v12-home{padding:12px!important}.v12-action-card.illustrated-card{grid-template-columns:105px 1fr auto;min-height:118px;padding-right:13px;gap:12px}.v12-action-card.illustrated-card .v123-card-art{width:105px;height:118px}.v12-action-card.illustrated-card strong{font-size:18px}.v12-action-card.illustrated-card small{font-size:12px}.v12-action-card.illustrated-card>b{font-size:34px}}
</style>
</head><body><div class="wrap">${drawing}<div class="card"><h1>${safe(p.code)} — ${safe(p.name||"Unnamed part")}</h1><div class="row"><strong>${p.length||"—"} × ${p.width||"—"} × ${p.thickness||"—"} mm</strong> · Qty ${p.qty||1}</div><div class="row">${safe(materialForPanel(p)||"Not set")}</div><div class="row">${safe(edgeText(p))}</div><div class="row muted">${safe(p.notes||"")}</div><div class="row muted">${safe(pr?.name||"")} · ${safe(c?.name||"")}</div></div><button class="back" onclick="parent.postMessage('assembleone-close-test','*')">Back to QR labels</button></div>




<div class="site-room-modal" id="siteRoomDetailsModal" aria-hidden="true">
 <div class="site-room-dialog" role="dialog" aria-modal="true" aria-labelledby="siteRoomDetailsTitle">
  <div class="site-room-head"><div class="room-badge" id="siteRoomDetailsIcon">📍</div><div><h2 id="siteRoomDetailsTitle">Site room</h2><p id="siteRoomDetailsMeta">Project details</p></div><button class="site-room-close" id="siteRoomDetailsClose" type="button" aria-label="Close">×</button></div>
  <div class="site-room-body">
   <section class="site-reference-pane"><div class="site-reference-frame" id="siteRoomReferenceFrame"><div class="site-reference-empty">No picture</div></div><div class="site-picture-caption" id="siteRoomPictureCaption"></div><div class="site-thumb-row" id="siteRoomThumbs"></div></section>
   <section class="site-design-pane"><div class="site-facts"><div class="site-fact"><b id="siteRoomPhotoCount">0</b><span>Photos</span></div><div class="site-fact"><b id="siteRoomMeasureCount">0</b><span>Measurements</span></div><div class="site-fact"><b id="siteRoomFloor">—</b><span>Floor</span></div><div class="site-fact"><b>Ready</b><span>Site package</span></div></div><div class="site-notes-box"><h3>Notes</h3><div id="siteRoomNotes">No extra notes</div></div><div class="site-drawing-placeholder">SketchUp drawing area<br>Use the site picture beside your drawing while designing</div><div class="site-detail-actions"><button class="btn primary" id="sitePhotoToDrawing" type="button">Use in Drawing</button><button class="btn" id="siteOpenProject" type="button">Open project details</button></div></section>
  </div>
 </div>
</div>

<div class="site-inbox-modal" id="siteInboxModal" aria-hidden="true">
 <div class="site-inbox-dialog" role="dialog" aria-modal="true" aria-labelledby="siteInboxModalTitle">
  <h2 id="siteInboxModalTitle">New site job received</h2>
  <p>The phone job is ready to open in Studio.</p>
  <div class="site-inbox-preview" id="siteInboxPreview"><div class="icon">☁️</div><div><strong>Site update</strong><span>Ready to import</span></div></div>
  <div class="site-inbox-actions"><button class="btn" id="siteInboxLater" type="button">Later</button><button class="btn primary" id="siteInboxImportNow" type="button">Open in Studio</button></div>
 </div>
</div>
</body></html>`;
 modal.classList.add("open");modal.setAttribute("aria-hidden","false");
}
function openGuidePreview(url){const modal=$("#guidePreviewModal"),frame=$("#guidePreviewFrame");if(!modal||!frame)return;qrReturnScroll=window.scrollY||0;frame.src=url;modal.classList.add("open");modal.setAttribute("aria-hidden","false")}
function closeGuidePreview(returnToQr=true){const modal=$("#guidePreviewModal"),frame=$("#guidePreviewFrame");if(modal){modal.classList.remove("open");modal.setAttribute("aria-hidden","true")}if(frame){frame.srcdoc="";frame.src="about:blank"}if(returnToQr){show("qr");requestAnimationFrame(()=>window.scrollTo({top:qrReturnScroll,behavior:"auto"}))}}
window.addEventListener("message",e=>{if(e.data==="assembleone-close-test")closeGuidePreview(true)});
document.addEventListener("click",e=>{const back=e.target.closest("#closeGuidePreview");if(back){e.preventDefault();e.stopPropagation();closeGuidePreview(true);return}if(e.target.id==="guidePreviewModal")closeGuidePreview(false)});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeGuidePreview()});

// Version 5.0: panel options behaves like a normal dropdown.
// Version 5.5: incomplete panels remain drawing drafts and are hidden from Panel Status and Cutting Lists.
const panelOptionsMenu=document.querySelector(".panel-options");
if(panelOptionsMenu){
  document.addEventListener("pointerdown",(event)=>{
    if(panelOptionsMenu.open && !panelOptionsMenu.contains(event.target)){
      panelOptionsMenu.open=false;
    }
  },true);
  document.addEventListener("keydown",(event)=>{
    if(event.key==="Escape") panelOptionsMenu.open=false;
  });
  document.querySelectorAll("button,input,textarea,select,a,summary").forEach(el=>{
    if(!panelOptionsMenu.contains(el)){
      el.addEventListener("focus",()=>{ if(panelOptionsMenu.open) panelOptionsMenu.open=false; });
    }
  });
}

load();


// --- block 2 ---

(function(){
 try{
 const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];
 const trades=[
  {n:"Builder",i:"👷"},{n:"Bricklayer",i:"🧱"},{n:"Carpenter",i:"🪚"},{n:"Electrician",i:"⚡"},
  {n:"Plumber",i:"🚿"},{n:"Decorator",i:"🎨"},{n:"Flooring",i:"▦"},{n:"Wardrobes",i:"🚪"},
  {n:"Kitchen Installer",i:"🍽️"},{n:"Tiler",i:"◫"},{n:"HVAC / Air Conditioning",i:"❄️"},
  {n:"Heating",i:"🔥"},{n:"Windows",i:"▤"},{n:"Doors",i:"🚪"},{n:"Roofer",i:"⌂"},
  {n:"Steelworker",i:"⚙️"},{n:"Landscaper",i:"🌿"},{n:"Supplier",i:"📦"},{n:"Client",i:"👤"},{n:"Other",i:"＋"}
 ];
 const tradeNames=["Measurement",...trades.map(x=>x.n)];
 const tradeKeyMap={"Builder":"builder","Bricklayer":"bricklayer","Carpenter":"carpenter","Electrician":"electrician","Plumber":"plumber","Decorator":"decorator","Flooring":"flooring","Wardrobes":"wardrobes","Kitchen Installer":"kitchenInstaller","Tiler":"tiler","HVAC / Air Conditioning":"hvac","Heating":"heating","Windows":"windows","Doors":"doors","Roofer":"roofer","Steelworker":"steelworker","Landscaper":"landscaper","Supplier":"supplier","Client":"client","Other":"other","Measurement":"measurement"};
 function tradeLabel(n){return st('trade.'+(tradeKeyMap[n]||n))}
 const dict={en:{sitePlanner:"Site Planner"},es:{sitePlanner:"Planificador de obra"},da:{sitePlanner:"Byggepladsplan"},ro:{sitePlanner:"Planificator de șantier"},pl:{sitePlanner:"Plan budowy"}};
 let pendingTrade=null, selectedPin=null, movingPin=false, activeChatTrade="Bricklayer", activeGroupId=null, linkSourceId=null, linkMoved=false, suppressMapClick=false;
 function sp(){const p=project();if(!p)return null;if(!p.sitePlanner)p.sitePlanner={plan:null,pins:[],stages:[],layers:{},language:"en"};p.sitePlanner.pins=p.sitePlanner.pins||[];p.sitePlanner.stages=p.sitePlanner.stages||[];p.sitePlanner.layers=p.sitePlanner.layers||{};p.sitePlanner.messages=p.sitePlanner.messages||{};p.sitePlanner.groups=p.sitePlanner.groups||[];return p.sitePlanner}
 function ti(n){if(n==="Measurement")return "↔";return trades.find(x=>x.n===n)?.i||"•"}
 function pinStatus(p){return p.status||"new"}
 function renderSite(){
  try{renderSiteInner()}catch(e){console.error('renderSite failed',e)}
 }
 function renderSiteInner(){
  const d=sp(),map=$("#siteMap"),img=$("#siteMapImage");if(!map)return;
  $("#siteTradePicker").innerHTML=trades.map(t=>`<button class="site-trade-pick ${pendingTrade===t.n?"active":""}" data-pick-trade="${safe(t.n)}"><b>${t.i}</b>${safe(tradeLabel(t.n))}</button>`).join("");
  $$("[data-pick-trade]").forEach(b=>b.onclick=()=>{pendingTrade=b.dataset.pickTrade;selectedPin=null;renderSite()});
  if(!d){map.classList.remove("has-image");return}
  if(d.plan){img.src=d.plan;map.classList.add("has-image")}else{img.removeAttribute("src");map.classList.remove("has-image")}
  map.querySelectorAll(".site-pin,.site-link-layer,.site-group-dot").forEach(x=>x.remove());
  const linkSvg=document.createElementNS("http://www.w3.org/2000/svg","svg");linkSvg.setAttribute("class","site-link-layer");linkSvg.setAttribute("viewBox","0 0 100 100");linkSvg.setAttribute("preserveAspectRatio","none");map.appendChild(linkSvg);
  (d.groups||[]).forEach(g=>{g.pinIds=(g.pinIds||[]).filter(id=>d.pins.some(p=>p.id===id));if(g.pinIds.length<2)return;const pts=g.pinIds.map(id=>d.pins.find(p=>p.id===id)).filter(Boolean),first=pts[0];pts.slice(1).forEach(pt=>{const line=document.createElementNS("http://www.w3.org/2000/svg","line");line.setAttribute("x1",first.x);line.setAttribute("y1",first.y);line.setAttribute("x2",pt.x);line.setAttribute("y2",pt.y);linkSvg.appendChild(line)});const cx=pts.reduce((a,p)=>a+p.x,0)/pts.length,cy=pts.reduce((a,p)=>a+p.y,0)/pts.length;const dot=document.createElement("button");dot.className="site-group-dot "+(activeGroupId===g.id?"active":"");dot.style.left=cx+"%";dot.style.top=cy+"%";dot.textContent="💬";dot.title="Open group chat";dot.onclick=e=>{e.stopPropagation();activeGroupId=g.id;renderSite();setTimeout(()=>document.getElementById("siteGroupChat")?.scrollIntoView({behavior:"smooth",block:"center"}),40)};map.appendChild(dot)});
  d.pins.forEach(p=>{if(d.layers[p.trade]===false)return;const b=document.createElement("button");b.className="site-pin "+String(p.trade||"").toLowerCase().replace(/\W+/g,"-")+(selectedPin===p.id?" selected":"")+(linkSourceId===p.id?" link-source":"");b.style.left=p.x+"%";b.style.top=p.y+"%";b.textContent=ti(p.trade);b.title=(p.area?p.area+" · ":"")+(p.note||p.trade)+" · drag to another pin for chat";b.dataset.pinId=p.id;
    b.onpointerdown=e=>{if(e.button!==undefined&&e.button!==0)return;e.stopPropagation();linkSourceId=p.id;linkMoved=false;b.setPointerCapture?.(e.pointerId);map.classList.add("link-dragging");};
    b.onpointermove=e=>{if(linkSourceId===p.id)linkMoved=true};
    b.onpointerup=e=>{e.stopPropagation();const target=document.elementFromPoint(e.clientX,e.clientY)?.closest?.(".site-pin");const targetId=target?target.dataset.pinId:null;map.classList.remove("link-dragging");if(linkSourceId&&targetId&&targetId!==linkSourceId){const ids=[linkSourceId,targetId];let groups=(d.groups||[]).filter(g=>g.pinIds.some(id=>ids.includes(id)));let group;if(groups.length){group=groups[0];ids.forEach(id=>{if(!group.pinIds.includes(id))group.pinIds.push(id)});groups.slice(1).forEach(other=>{other.pinIds.forEach(id=>{if(!group.pinIds.includes(id))group.pinIds.push(id)});d.groups=d.groups.filter(g=>g.id!==other.id)})}else{group={id:uid(),pinIds:ids,messages:[],status:"open"};d.groups.push(group)}activeGroupId=group.id;suppressMapClick=true;save();linkSourceId=null;renderSite();setTimeout(()=>document.getElementById("siteGroupChat")?.scrollIntoView({behavior:"smooth",block:"center"}),40);return}const wasMoved=linkMoved;linkSourceId=null;map.classList.remove("link-dragging");if(!wasMoved){selectedPin=p.id;pendingTrade=null;movingPin=false;renderSite()}};map.appendChild(b)});
  map.classList.toggle("move-mode",movingPin);
  map.querySelectorAll(".site-pin-toolbar").forEach(x=>x.remove());
  const selected=d.pins.find(x=>x.id===selectedPin);
  if(selected){const bar=document.createElement("div");bar.className="site-pin-toolbar";bar.innerHTML=`<button class="primary" data-pin-action="message">💬 ${st('common.messagePrefix')}${safe(tradeLabel(selected.trade))}</button><button data-pin-action="move" class="${movingPin?"active":""}">✥ ${st('common.move')}</button><button data-pin-action="done">✓ ${st('common.done')}</button><button class="danger" data-pin-action="delete">🗑 ${st('common.delete')}</button>`;map.appendChild(bar);bar.onclick=e=>e.stopPropagation();bar.querySelector('[data-pin-action="move"]').onclick=()=>{movingPin=!movingPin;renderSite()};bar.querySelector('[data-pin-action="delete"]').onclick=()=>{if(confirm(st('msg.confirmRemovePin'))){d.pins=d.pins.filter(x=>x.id!==selected.id);d.groups=(d.groups||[]).map(g=>({...g,pinIds:g.pinIds.filter(id=>id!==selected.id)})).filter(g=>g.pinIds.length>1);selectedPin=null;movingPin=false;save();renderSite()}};bar.querySelector('[data-pin-action="done"]').onclick=()=>{selected.status="done";save();renderSite()};bar.querySelector('[data-pin-action="message"]').onclick=()=>{activeChatTrade=selected.trade;renderSite();setTimeout(()=>document.getElementById("siteDirectChat")?.scrollIntoView({behavior:"smooth",block:"center"}),50)}}
  $("#siteLayers").innerHTML=tradeNames.map(t=>`<button class="layer-chip ${d.layers[t]===false?"off":""}" data-layer="${safe(t)}">${ti(t)} ${safe(tradeLabel(t))}</button>`).join("");
  $$("[data-layer]").forEach(b=>b.onclick=()=>{d.layers[b.dataset.layer]=d.layers[b.dataset.layer]===false?true:false;save();renderSite()});
  const p=d.pins.find(x=>x.id===selectedPin);
  if(!p)$("#siteEditor").innerHTML=`<div class="empty">${st('common.tapPinOnPlan')}</div>`;
  else{
   p.thread=p.thread||[];
   $("#siteEditor").innerHTML=`<div class="site-editor-grid">
    <div class="pin-summary">${ti(p.trade)} ${safe(tradeLabel(p.trade))}${p.area?" · "+safe(p.area):""}</div>
    <label>${st('common.tradeLabel')}<select id="spTrade">${tradeNames.map(t=>`<option value="${safe(t)}" ${t===p.trade?"selected":""}>${safe(tradeLabel(t))}</option>`).join("")}</select></label>
    <label>${st('common.roomAreaLabel')}<input id="spArea" value="${safe(p.area||"")}" placeholder="${st('common.bathroomExample')}"></label>
    <label class="wide">${st('common.statusLabel')}<div class="site-status-row">${[["new",st('common.pinStatusNew')],["waiting",st('common.pinStatusWaiting')],["done",st('common.pinStatusDone')],["problem",st('common.pinStatusProblem')]].map(x=>`<button type="button" data-pin-status="${x[0]}" class="${pinStatus(p)===x[0]?"active":""}">${x[1]}</button>`).join("")}</div></label>
    ${p.trade==="Measurement"?`<label>${st('common.measurementTypeLabel')}<input id="spType" value="${safe(p.measureType||st('common.wallToWall'))}"></label><label>${st('common.measurementMmLabel')}<input id="spValue" inputmode="decimal" value="${safe(p.value||"")}"></label>`:""}
    <label class="wide">${st('common.mainNoteLabel')}<textarea id="spNote" placeholder="${st('common.whatNeedsDoingPlaceholder')}">${safe(p.note||"")}</textarea></label>
    <label class="wide">${st('common.photoLabel')}<input id="spPhoto" type="file" accept="image/*"></label>
    ${p.photo?`<img class="wide" src="${p.photo}" style="max-width:100%;border-radius:8px">`:""}
    <button class="btn primary wide" id="spSavePin">${st('common.savePinBtn')}</button><button class="btn danger wide" id="spDeletePin">${st('common.deletePinBtn')}</button>
    <div class="site-chat wide"><h4>${st('common.conversationAtPin')}</h4>
      <div>${p.thread.length?p.thread.map(m=>`<div class="chat-message"><strong>${ti(m.trade)} ${safe(tradeLabel(m.trade))}</strong>${safe(m.text)}<small style="display:block;margin-top:4px;color:#777">${safe(m.date||"")}</small></div>`).join(""):`<div class="muted">${st('common.noRepliesYet')}</div>`}</div>
      <div class="chat-compose"><select id="spReplyTrade">${trades.map(t=>`<option value="${safe(t.n)}">${safe(tradeLabel(t.n))}</option>`).join("")}</select><input id="spReplyText" placeholder="${st('common.writeShortReplyPlaceholder')}"><button class="btn primary" id="spReplySend">${st('common.sendBtn')}</button></div>
    </div>
   </div>`;
   let chosenStatus=pinStatus(p);
   $$("[data-pin-status]").forEach(b=>b.onclick=()=>{chosenStatus=b.dataset.pinStatus;$$("[data-pin-status]").forEach(x=>x.classList.toggle("active",x===b))});
   $("#spSavePin").onclick=()=>{p.trade=$("#spTrade").value;p.area=$("#spArea").value.trim();p.status=chosenStatus;p.note=$("#spNote").value.trim();if($("#spType"))p.measureType=$("#spType").value;if($("#spValue"))p.value=$("#spValue").value;save();renderSite()};
   $("#spDeletePin").onclick=()=>{if(confirm(st('msg.confirmRemovePin'))){d.pins=d.pins.filter(x=>x.id!==p.id);d.groups=(d.groups||[]).map(g=>({...g,pinIds:g.pinIds.filter(id=>id!==p.id)})).filter(g=>g.pinIds.length>1);selectedPin=null;movingPin=false;save();renderSite()}};
   $("#spPhoto").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{p.photo=r.result;save();renderSite()};r.readAsDataURL(f)};
   $("#spReplySend").onclick=()=>{const text=$("#spReplyText").value.trim();if(!text)return;p.thread.unshift({id:uid(),trade:$("#spReplyTrade").value,text,date:new Date().toLocaleString()});save();renderSite()};
  }
  const groupHost=document.getElementById("siteGroupChat");if(groupHost){const g=(d.groups||[]).find(x=>x.id===activeGroupId);if(!g){groupHost.innerHTML=`<div class="empty">${st('common.dragTradePinToStart')}</div>`}else{g.messages=g.messages||[];const members=g.pinIds.map(id=>d.pins.find(p=>p.id===id)).filter(Boolean);groupHost.innerHTML=`<div class="group-chat-card"><div class="group-chat-head"><h4>💬 ${members.map(p=>safe(tradeLabel(p.trade))).join(" + ")}</h4><div><button class="btn" id="groupDone">${g.status==="done"?st('common.reopen'):st('common.markDone')}</button> <button class="btn danger" id="groupDelete">${st('common.deleteLink')}</button></div></div><div class="group-members">${members.map(p=>`<span class="group-member">${ti(p.trade)} ${safe(tradeLabel(p.trade))}</span>`).join("")}</div><div class="group-chat-messages">${g.messages.length?g.messages.map(m=>`<div class="direct-msg ${m.from==="You"?"me":""}"><strong>${ti(m.trade)} ${safe(tradeLabel(m.trade))}</strong>${safe(m.text)}<small>${safe(m.date||"")}</small></div>`).join(""):`<div class="muted">${st('common.noMessagesYet')}</div>`}</div><div class="group-chat-compose"><select id="groupFrom">${members.map(p=>`<option value="${safe(p.trade)}">${safe(tradeLabel(p.trade))}</option>`).join("")}</select><input id="groupText" placeholder="${st('common.writeShortMessagePlaceholder')}"><button class="btn primary" id="groupSend">${st('common.sendBtn')}</button></div></div>`;document.getElementById("groupSend").onclick=()=>{const input=document.getElementById("groupText"),text=input.value.trim();if(!text)return;g.messages.push({id:uid(),from:"You",trade:document.getElementById("groupFrom").value,text,date:new Date().toLocaleString(),language:d.language||"en"});save();renderSite()};document.getElementById("groupDone").onclick=()=>{g.status=g.status==="done"?"open":"done";save();renderSite()};document.getElementById("groupDelete").onclick=()=>{if(confirm(st('msg.confirmRemoveLinkedGroupChat'))){d.groups=d.groups.filter(x=>x.id!==g.id);activeGroupId=null;save();renderSite()}}}}
  const direct=d.messages||{};
  if(!direct[activeChatTrade])direct[activeChatTrade]=[];
  const chatEl=$("#siteDirectChat");if(chatEl){chatEl.innerHTML=`<div class="direct-chat-grid"><div class="direct-chat-list">${trades.map(t=>`<button class="direct-chat-contact ${activeChatTrade===t.n?"active":""}" data-chat-trade="${safe(t.n)}"><span>${t.i} ${safe(tradeLabel(t.n))}</span><span>${(direct[t.n]||[]).length}</span></button>`).join("")}</div><div class="direct-chat-window"><h4>${ti(activeChatTrade)} ${safe(tradeLabel(activeChatTrade))}</h4><div class="direct-chat-messages">${direct[activeChatTrade].length?direct[activeChatTrade].map(m=>`<div class="direct-msg ${m.from==="You"?"me":""}"><strong>${safe(m.from||"You")}</strong>${safe(m.text)}<small>${safe(m.date||"")}</small></div>`).join(""):`<div class="muted">${st('common.noMessagesYet')}</div>`}</div><div class="direct-chat-compose"><input id="directChatText" placeholder="${st('common.messagePrefix')}${safe(tradeLabel(activeChatTrade))}…"><button class="btn primary" id="directChatSend">${st('common.sendBtn')}</button></div></div></div>`;$$('[data-chat-trade]').forEach(b=>b.onclick=()=>{activeChatTrade=b.dataset.chatTrade;renderSite()});$("#directChatSend").onclick=()=>{const input=$("#directChatText"),text=input.value.trim();if(!text)return;direct[activeChatTrade].push({id:uid(),from:"You",text,date:new Date().toLocaleString(),language:d.language||"en"});save();renderSite()};}
  $("#siteProgress").innerHTML=d.stages.length?d.stages.map(sg=>`<div class="site-stage"><div class="site-stage-head"><strong>${safe(sg.trade)}</strong><select data-stage-status="${sg.id}"><option value="waiting" ${sg.status==="waiting"?"selected":""}>${st('common.stageWaiting')}</option><option value="started" ${sg.status==="started"?"selected":""}>${st('common.stageStarted')}</option><option value="delayed" ${sg.status==="delayed"?"selected":""}>${st('common.stageDelayed')}</option><option value="ready" ${sg.status==="ready"?"selected":""}>${st('common.stageReadyNext')}</option><option value="complete" ${sg.status==="complete"?"selected":""}>${st('common.stageComplete')}</option></select></div><button class="btn danger" data-stage-delete="${sg.id}">${st('common.delete')}</button></div>`).join(""):`<div class="empty">${st('common.addStagesHint')}</div>`;
  $$("[data-stage-status]").forEach(el=>el.onchange=()=>{const st=d.stages.find(x=>x.id===el.dataset.stageStatus);if(st){st.status=el.value;save()}});
  $$("[data-stage-delete]").forEach(b=>b.onclick=()=>{d.stages=d.stages.filter(x=>x.id!==b.dataset.stageDelete);save();renderSite()});
 }
 $("#sitePlanInput").onchange=e=>{const f=e.target.files[0],d=sp();if(!f||!d)return;const r=new FileReader();r.onload=()=>{d.plan=r.result;save();renderSite()};r.readAsDataURL(f)};
 $("#siteAddMeasurement").onclick=()=>{pendingTrade="Measurement";selectedPin=null;renderSite()};
 $("#siteAddProgress").onclick=()=>{const d=sp(),t=prompt(st('common.tradeOrStagePrompt'),tradeLabel("Plumber"));if(!d||!t)return;d.stages.push({id:uid(),trade:t,status:"waiting"});save();renderSite()};
 $("#siteMap").onclick=e=>{const d=sp();if(!d)return;if(suppressMapClick){suppressMapClick=false;return;}if(!d.plan){$("#sitePlanInput").click();return}const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*100,y=(e.clientY-r.top)/r.height*100;if(movingPin&&selectedPin){const p=d.pins.find(x=>x.id===selectedPin);if(p){p.x=Math.max(0,Math.min(100,x));p.y=Math.max(0,Math.min(100,y));movingPin=false;save();renderSite()}return}if(!pendingTrade)return;const p={id:uid(),trade:pendingTrade,x,y,area:"",status:"new",measureType:pendingTrade==="Measurement"?"Wall to wall":"",value:"",note:"",thread:[],visibility:"shared"};d.pins.push(p);selectedPin=p.id;pendingTrade=null;save();renderSite()};
 const oldRenderAll=renderAll;renderAll=function(){oldRenderAll();renderSite()};
 window.renderSitePlanner=renderSite;try{renderSite()}catch(e){console.error('renderSite failed on init',e)}
 }catch(e){console.error('Site planner init failed',e)}
})();

const appLang=document.getElementById('appLanguage');
function paintFlagLanguage(lang){document.querySelectorAll('#flagLanguageButtons [data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===lang))}
if(appLang){appLang.value=localStorage.getItem('assembleone_language')||'en';appLang.addEventListener('change',e=>{try{applyAppLanguage(e.target.value)}catch(err){console.error('applyAppLanguage failed',err)}paintFlagLanguage(e.target.value)});document.querySelectorAll('#flagLanguageButtons [data-lang]').forEach(b=>b.addEventListener('click',(e)=>{const box=document.getElementById('flagLanguageButtons');if(!box.classList.contains('open')){box.classList.add('open');e.stopPropagation();return;}appLang.value=b.dataset.lang;appLang.dispatchEvent(new Event('change'));box.classList.remove('open');e.stopPropagation()}));document.addEventListener('click',()=>document.getElementById('flagLanguageButtons')?.classList.remove('open'));try{applyAppLanguage(appLang.value)}catch(err){console.error('applyAppLanguage failed on init',err)}paintFlagLanguage(appLang.value)}


// --- block 3 ---

(function(){
  const order=["jobs","mark","parts","cutting","qr","bom"];
  function completePart(p){return !!(String(p?.name||"").trim() && Number(p?.length)>0 && Number(p?.width)>0 && Number(p?.thickness)>0 && Number(p?.qty)>0)}
  function readiness(){
    const p=project();
    const cabinets=p?.cabinets||[];
    const all=cabinets.flatMap(c=>c.parts||[]);
    const start=!!(p && String(p.name||"").trim() && String(p.customer||"").trim() && (p.rooms||[]).length && cabinets.length);
    const drawing=!!(start && cabinets.every(c=>c.drawing) && all.length);
    const panels=!!(drawing && all.every(completePart));
    const cutting=panels;
    const qr=!!(cutting && p.qrReady);
    return [start,drawing,panels,cutting,qr,true];
  }
  window.updateWorkflowProgress=function(name){
    const ready=readiness(),current=Math.max(0,order.indexOf(name));
    document.querySelectorAll('[data-step-screen]').forEach((el,i)=>{
      el.classList.toggle('current',i===current);
      el.classList.toggle('complete',!!ready[i]);
      el.classList.toggle('locked',i===5&&!ready.slice(0,5).every(Boolean));
      const badge=el.querySelector('.workflow-status');
      if(badge && !ready[i]) badge.textContent=String(i+1);
      el.title=i===5&&!ready.slice(0,5).every(Boolean)?st('common.completeFirstFiveStages'):st('common.openThisSection');
    });
    const canSend=ready.slice(0,5).every(Boolean);
    ['exportMobileBtn','bomExportBtn','refreshBomBtn'].forEach(id=>{const b=document.getElementById(id);if(b)b.disabled=!canSend});
    return ready;
  };
  document.querySelectorAll('[data-step-screen]').forEach(el=>el.addEventListener('click',()=>{
    const target=el.dataset.stepScreen;
    if(target==='bom' && !readiness().slice(0,5).every(Boolean)){
      alert(st('msg.finishAllSectionsFirst'));
      return;
    }
    show(target);
  }));
  const qrBtn=document.getElementById('generateQrBtn');
  if(qrBtn)qrBtn.addEventListener('click',()=>{const p=project();if(p){p.qrReady=true;save();setTimeout(()=>updateWorkflowProgress(state.screen||'qr'),0)}});
  // guardedExport (a readiness-gated wrapper around the old exportProjectToMobile) and
  // its exportMobileBtn/bomExportBtn/refreshBomBtn bindings lived here. None of those
  // three button ids exist in the current Studio markup and exportProjectToMobile no
  // longer exists (see the sync block removal above), so this had no live effect.
  const oldRenderAll=renderAll;
  window.renderAll=function(){oldRenderAll();updateWorkflowProgress(state.screen||'jobs')};
  const stage=document.getElementById('drawingStage');
  if(stage){
    const observer=new MutationObserver(()=>{if(!stage.classList.contains('expanded'))requestAnimationFrame(renderRooms)});
    observer.observe(stage,{attributes:true,attributeFilter:['class']});
  }
  updateWorkflowProgress(state.screen||'jobs');
})();


// --- block 4 ---

(function(){
  // Always open the visual room chooser, even after the project page is re-rendered.
  const roomButton=document.getElementById('studioAddRoomBtn');
  if(roomButton){
    roomButton.onclick=null;
    roomButton.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();addStudioRoom();});
  }
  document.addEventListener('click',function(e){
    const b=e.target.closest && e.target.closest('#studioAddRoomBtn');
    if(!b)return;
    e.preventDefault();e.stopPropagation();
    if(!document.querySelector('.room-type-dialog'))addStudioRoom();
  },true);

  // Never let Edge navigate away when a drawing or screenshot is dropped.
  ['dragenter','dragover','drop'].forEach(type=>window.addEventListener(type,function(e){
    if(e.dataTransfer && Array.from(e.dataTransfer.types||[]).some(t=>t==='Files')){
      e.preventDefault();
      // Allow the drawing area drop handler to receive the file.
    }
  },true));
  const stage=document.getElementById('drawingStage');
  if(stage){
    stage.addEventListener('drop',async function(e){
      e.preventDefault();e.stopPropagation();
      stage.classList.remove('drag-over','expanded');
      state.drawingZoom=1;
      const files=Array.from(e.dataTransfer?.files||[]);
      const file=files.find(drawingFileAllowed);
      if(file)await importRoomsFile(file);
      else alert(st('msg.dropValidFileTypes'));
    },true);
  }

  // Completion is based on actual saved work, not which page was visited.
  const steps=['jobs','mark','parts','cutting','qr','bom'];
  function partNamed(x){return !!String(x?.name||'').trim()}
  function partComplete(x){return partNamed(x)&&Number(x.length)>0&&Number(x.width)>0&&Number(x.thickness)>0&&Number(x.qty||1)>0}
  function getReady(){
    const p=project();
    const cabinets=p?.cabinets||[];
    const parts=cabinets.flatMap(c=>c.parts||[]);
    const start=!!(p&&String(p.name||'').trim()&&String(p.customer||'').trim());
    const drawing=!!(start&&cabinets.some(c=>!!c.drawing));
    const panels=!!(drawing&&parts.some(partNamed));
    const cutting=!!(panels&&parts.length&&parts.every(partComplete));
    const qr=!!(cutting&&p?.qrReady);
    const finish=start&&drawing&&panels&&cutting&&qr;
    return [start,drawing,panels,cutting,qr,finish];
  }
  window.updateWorkflowProgress=function(name){
    const ready=getReady();
    const current=Math.max(0,steps.indexOf(name));
    document.querySelectorAll('[data-step-screen]').forEach((el,i)=>{
      el.classList.toggle('current',i===current&&!ready[i]);
      el.classList.toggle('complete',!!ready[i]);
      el.classList.toggle('locked',i===5&&!ready[5]);
      const badge=el.querySelector('.workflow-status');
      if(badge)badge.textContent=ready[i]?'':String(i+1);
      el.title=(i===5&&!ready[5])?st('common.completeFirstFiveStages'):st('common.openThisSection');
    });
    ['exportMobileBtn','bomExportBtn','refreshBomBtn'].forEach(id=>{const b=document.getElementById(id);if(b)b.disabled=!ready[5]});
    return ready;
  };
  // Recheck immediately whenever the user types, selects, saves or imports.
  ['input','change','click'].forEach(type=>document.addEventListener(type,function(){setTimeout(()=>updateWorkflowProgress(state.screen||'jobs'),0)},true));
  const oldImport=window.importRoomsFile||importRoomsFile;
  window.importRoomsFile=async function(file){
    const st=document.getElementById('drawingStage');
    if(st)st.classList.remove('expanded');
    state.drawingZoom=1;
    const result=await oldImport(file);
    setTimeout(()=>{renderRooms();updateWorkflowProgress('mark')},30);
    return result;
  };
  setTimeout(()=>updateWorkflowProgress(state.screen||'jobs'),0);
})();


// --- block 5 ---

(function(){
  const stage=document.getElementById('drawingStage');
  if(!stage)return;
  function hasFiles(e){return Array.from(e.dataTransfer?.types||[]).includes('Files')}
  stage.addEventListener('dragenter',function(e){
    if(!hasFiles(e))return;
    e.preventDefault();
    stage.classList.add('drag-over');
  },true);
  stage.addEventListener('dragover',function(e){
    if(!hasFiles(e))return;
    e.preventDefault();
    e.dataTransfer.dropEffect='copy';
    stage.classList.add('drag-over');
  },true);
  stage.addEventListener('dragleave',function(e){
    if(!stage.contains(e.relatedTarget))stage.classList.remove('drag-over');
  },true);
  stage.addEventListener('drop',function(){stage.classList.remove('drag-over')},true);
})();


// --- block 6 ---

(function(){
  const stepOrder=['jobs','mark','parts','cutting','qr','bom'];
  const stepLabels=()=>[st('step.start'),st('step.drawing'),st('step.panels'),st('step.cuttingList'),st('step.qrLabels'),st('step.finish')];

  function currentProjectData(){
    try{return project()}catch(e){return null}
  }
  function namedPart(x){return !!String(x&&x.name||'').trim()}
  function completePart(x){
    return namedPart(x) && Number(x.length)>0 && Number(x.width)>0 && Number(x.thickness)>0 && Number(x.qty||1)>0;
  }
  function liveText(id,fallback){
    const el=document.getElementById(id);
    return el ? String(el.value||'').trim() : String(fallback||'').trim();
  }
  function workflowReady(){
    const p=currentProjectData();
    const cabinets=(p&&p.cabinets)||[];
    const parts=cabinets.flatMap(c=>c.parts||[]);
    const start=!!(p && liveText('projectName',p.name) && liveText('customerName',p.customer));
    const drawing=!!(start && cabinets.some(c=>!!c.drawing));
    const panels=!!(drawing && parts.some(namedPart));
    const cutting=!!(panels && parts.length && parts.every(completePart));
    const qr=!!(cutting && p && p.qrReady);
    return [start,drawing,panels,cutting,qr,start&&drawing&&panels&&cutting&&qr];
  }
  function persistStartFields(){
    const p=currentProjectData();
    if(!p)return;
    const n=document.getElementById('projectName');
    const c=document.getElementById('customerName');
    let changed=false;
    if(n && p.name!==n.value){p.name=n.value;changed=true}
    if(c && p.customer!==c.value){p.customer=c.value;changed=true}
    if(changed){try{save()}catch(e){}try{renderHeader()}catch(e){}}
  }
  function refreshGuide(screen){
    const ready=workflowReady();
    const active=stepOrder.indexOf(screen||state.screen||'jobs');
    document.querySelectorAll('#workflowProgress [data-step-screen]').forEach((el,i)=>{
      el.classList.toggle('complete',ready[i]);
      el.classList.toggle('current',i===active && !ready[i]);
      el.classList.remove('locked');
      const badge=el.querySelector('.workflow-status');
      if(badge){
        badge.textContent=ready[i]?'✓':String(i+1);
        badge.style.fontSize='';
      }
      el.setAttribute('aria-label',stepLabels()[i]+(ready[i]?st('common.completeSuffix'):st('common.notCompleteSuffix')));
      el.title=st('common.openStepPrefix')+stepLabels()[i];
    });
    const canSend=ready[5];
    ['exportMobileBtn','bomExportBtn','refreshBomBtn'].forEach(id=>{
      const b=document.getElementById(id);
      if(b){
        b.disabled=!canSend;
        b.title=canSend?st('common.sendCompletedProjectPhone'):st('common.completeAllFiveStepsFirst');
      }
    });
    return ready;
  }
  window.updateWorkflowProgress=refreshGuide;

  // Capture clicks so every guide tile always opens its own section.
  const guide=document.getElementById('workflowProgress');
  if(guide){
    guide.addEventListener('click',function(e){
      const tile=e.target.closest('[data-step-screen]');
      if(!tile)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const target=tile.dataset.stepScreen;
      show(target);
      setTimeout(()=>refreshGuide(target),0);
    },true);
  }

  document.addEventListener('input',function(e){
    if(e.target && (e.target.id==='projectName'||e.target.id==='customerName')){
      persistStartFields();
      refreshGuide(state.screen||'jobs');
    }
  },true);
  document.addEventListener('change',function(){setTimeout(()=>refreshGuide(state.screen||'jobs'),0)},true);
  document.addEventListener('click',function(){setTimeout(()=>refreshGuide(state.screen||'jobs'),25)},true);

  // Catch saved drawing, panel, measurement and QR changes even when old render code does not call the guide.
  setInterval(()=>refreshGuide(state.screen||'jobs'),700);
  setTimeout(()=>refreshGuide(state.screen||'jobs'),0);
})();


// --- block 7 ---

(function(){
  const order=['jobs','mark','parts','cutting','qr','bom'];
  const labels=()=>[st('step.start'),st('step.drawing'),st('step.panels'),st('step.cuttingList'),st('step.qrLabels'),st('step.finish')];
  function P(){try{return project()}catch(e){return null}}
  function value(id,fallback){const el=document.getElementById(id);return String(el?el.value:(fallback||'')).trim()}
  function named(x){return !!String(x&&x.name||'').trim()}
  function measured(x){return named(x)&&Number(x.length)>0&&Number(x.width)>0&&Number(x.thickness)>0&&Number(x.qty||1)>0}
  function checks(){
    const p=P(), cabinets=(p&&p.cabinets)||[], parts=cabinets.flatMap(c=>c.parts||[]);
    const start=!!(value('projectName',p&&p.name)&&value('customerName',p&&p.customer));
    const drawing=!!(start&&cabinets.some(c=>!!c.drawing));
    const panels=!!(drawing&&parts.some(named));
    const cutting=!!(panels&&parts.length&&parts.every(measured));
    const qr=!!(cutting&&p&&p.qrReady);
    return [start,drawing,panels,cutting,qr,start&&drawing&&panels&&cutting&&qr];
  }
  function syncStart(){
    const p=P(); if(!p)return;
    const n=document.getElementById('projectName'), c=document.getElementById('customerName');
    if(n)p.name=n.value; if(c)p.customer=c.value;
    try{save()}catch(e){}
  }
  function paint(screen){
    const ready=checks(), active=order.indexOf(screen||state.screen||'jobs');
    document.querySelectorAll('#workflowProgress [data-step-screen]').forEach((el,i)=>{
      el.classList.toggle('complete',!!ready[i]);
      el.classList.toggle('current',i===active&&!ready[i]);
      const badge=el.querySelector('.workflow-status'); if(badge)badge.textContent=ready[i]?'':String(i+1);
      el.title=st('common.openStepPrefix')+labels()[i];
    });
    ['exportMobileBtn','bomExportBtn','refreshBomBtn'].forEach(id=>{const b=document.getElementById(id);if(b)b.disabled=!ready[5]});
    return ready;
  }
  window.updateWorkflowProgress=paint;
  ['projectName','customerName'].forEach(id=>{
    const el=document.getElementById(id); if(!el)return;
    const update=()=>{syncStart();paint('jobs')};
    el.addEventListener('input',update); el.addEventListener('change',update); el.addEventListener('blur',update);
  });
  const guide=document.getElementById('workflowProgress');
  if(guide)guide.onclick=function(e){const tile=e.target.closest('[data-step-screen]');if(!tile)return;e.preventDefault();show(tile.dataset.stepScreen);paint(tile.dataset.stepScreen)};

  // One dependable visual Add room action with the original picture choices.
  document.addEventListener('click',function(e){
    const btn=e.target.closest&&e.target.closest('#studioAddRoomBtn'); if(!btn)return;
    e.preventDefault();e.stopPropagation();
    document.querySelectorAll('.room-type-dialog').forEach(x=>x.remove());
    addStudioRoom();
  },true);
  setTimeout(()=>paint(state.screen||'jobs'),0);
})();


// --- block 8 ---

(function(){
  function esc(v){return String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
  function getProject(){try{return project()}catch(e){return null}}
  function roomLabel(room){
    const t=((room&&room.type)||(room&&room.name)||'').toLowerCase();
    if(t.includes('tv')) return 'TV wall';
    if(t.includes('wine')) return 'wine cabinet';
    if(t.includes('kitchen')) return 'kitchen';
    if(t.includes('office')) return 'office unit';
    if(t.includes('laundry')||t.includes('utility')) return 'cabinet';
    if(t.includes('living')) return 'living room unit';
    if(t.includes('under stairs')) return 'under stairs unit';
    return 'wardrobe';
  }
  function selectedRoom(){try{return selectedStudioRoom()}catch(e){return null}}
  function openEdit(){
    const p=getProject(); if(!p) return;
    const o=document.createElement('div'); o.className='a100-edit-dialog';
    o.innerHTML=`<div class="a100-edit-sheet"><h2>${st('common.editJobHeading')}</h2><label>${st('common.jobNameLabel')}<input id="a100JobName"></label><label>${st('common.customerLabel')}<input id="a100Customer"></label><div class="a100-edit-actions"><button class="btn" id="a100Cancel">${st('common.cancelBtn')}</button><button class="btn primary" id="a100Save">${st('common.saveBtn')}</button></div></div>`;
    document.body.appendChild(o); o.querySelector('#a100JobName').value=p.name||''; o.querySelector('#a100Customer').value=p.customer||'';
    const close=()=>o.remove(); o.querySelector('#a100Cancel').onclick=close; o.onclick=e=>{if(e.target===o)close()};
    o.querySelector('#a100Save').onclick=()=>{p.name=o.querySelector('#a100JobName').value.trim()||p.name;p.customer=o.querySelector('#a100Customer').value.trim();const pn=document.getElementById('projectName'),cn=document.getElementById('customerName');if(pn)pn.value=p.name;if(cn)cn.value=p.customer;save();close();renderAll();renderA100Start()};
  }
  window.renderA100Start=function(){
    const workspace=document.getElementById('combinedProjectWorkspace'); if(!workspace)return;
    let shell=document.getElementById('a100StartShell');
    if(!shell){shell=document.createElement('div');shell.id='a100StartShell';shell.className='a100-start-shell';workspace.prepend(shell)}
    const p=getProject();
    if(!p){shell.innerHTML=`<div class="a100-empty-note">${st('common.createOrOpenJobNote')}</div>`;return}
    const room=selectedRoom(); const units=(p.cabinets||[]).filter(c=>room&&c.roomId===room.id);
    shell.innerHTML=`
      <div class="a100-project-card">
        <div class="a100-project-top">
          <div class="a100-project-icon">📁</div>
          <div class="a100-project-copy"><div class="a100-project-name">${esc(p.name||st('common.untitledJob'))}</div><div class="a100-customer">👤 ${esc(p.customer||st('common.addCustomer'))}</div></div>
          <button class="btn a100-edit" id="a100EditJob">${st('common.editBtn')}</button>
        </div>
        <button class="a100-room-row" id="a100ChooseRoom">
          <span class="a100-room-icon">${room?esc(room.icon||'🏠'):'🏠'}</span>
          <span class="a100-room-text">${room?esc(room.name):st('common.chooseRoomBtn')}</span>
          <span class="a100-room-tick">${room?'✓':''}</span>
        </button>
      </div>
      ${room?`<button class="a100-add-unit" id="a100AddUnit">${st('common.continueToDrawing')}</button>`:''}
      <div class="a100-units">${units.map(c=>`<div class="a100-unit-row"><strong>${esc(c.name)}</strong><button class="btn primary" data-a100-open-unit="${c.id}">${st('common.openDrawingBtn')}</button></div>`).join('')}</div>`;
    document.getElementById('a100EditJob').onclick=openEdit;
    document.getElementById('a100ChooseRoom').onclick=()=>{const b=document.getElementById('studioAddRoomBtn'); if(b)b.click(); else if(window.addStudioRoom)addStudioRoom()};
    const add=document.getElementById('a100AddUnit');
    if(add)add.onclick=()=>{
      const p=getProject(),room=selectedRoom();
      if(!p||!room)return;
      let c=(p.cabinets||[]).find(x=>x.roomId===room.id);
      let isNew=false;
      if(!c){
        const base=roomLabel(room),same=(p.cabinets||[]).filter(x=>x.roomId===room.id).length;
        const name=(base.charAt(0).toUpperCase()+base.slice(1))+(same?` ${same+1}`:'');
        c={id:uid(),name,roomId:room.id,drawing:null,drawingType:null,parts:[]};
        p.cabinets.push(c);
        isNew=true;
      }
      const goToDrawing=()=>{
        state.currentCabinet=c.id;state.currentPart=null;save();renderAll();show('mark');
        setTimeout(()=>{const dz=document.getElementById('drawingZone');if(dz)dz.scrollIntoView({behavior:'smooth',block:'center'})},80);
      };
      if(isNew&&typeof window.offerTemplatePicker==='function'&&(state.templates||[]).length){
        window.offerTemplatePicker(c,goToDrawing);
      } else {
        goToDrawing();
      }
    };
    shell.querySelectorAll('[data-a100-open-unit]').forEach(b=>b.onclick=()=>{state.currentCabinet=b.dataset.a100OpenUnit;state.currentPart=null;save();renderAll();show('mark')});
  }
  const oldRenderAll=window.renderAll; if(oldRenderAll){window.renderAll=function(){const r=oldRenderAll.apply(this,arguments);setTimeout(renderA100Start,0);return r}}
  const oldCreate=window.createStudioRoom; if(oldCreate){window.createStudioRoom=function(){const r=oldCreate.apply(this,arguments);setTimeout(renderA100Start,0);return r}}
  const oldAdd=window.addCabinet; if(oldAdd){window.addCabinet=function(){return oldAdd.apply(this,arguments)}}
  document.addEventListener('click',e=>{
    const nj=e.target.closest&&e.target.closest('#newJobBtn'); if(nj)setTimeout(renderA100Start,50);
  },true);
  document.addEventListener('DOMContentLoaded',()=>{
    const toolbar=document.querySelector('#screen-jobs>.toolbar');
    const newBtn=document.getElementById('newJobBtn'); if(newBtn)newBtn.textContent='＋ New Job';
    if(toolbar&&!document.getElementById('a100OpenJobs')){const b=document.createElement('button');b.className='btn';b.id='a100OpenJobs';b.textContent='📂 Open Jobs';toolbar.appendChild(b);b.onclick=()=>{const grid=document.getElementById('jobGrid');grid.classList.toggle('a100-open');b.textContent=grid.classList.contains('a100-open')?'Close Jobs':'📂 Open Jobs'}}
    const name=document.getElementById('projectName'),cust=document.getElementById('customerName'); if(name)name.closest('section').style.display='none';
    setTimeout(renderA100Start,60);
  });
})();


// --- block 9 ---

(function(){
  function closePartMenus(){
    document.querySelectorAll('#screen-mark .quick-pop').forEach(x=>x.classList.remove('open'));
    const chosen=document.querySelector('#screen-mark .chosen-parts'); if(chosen) chosen.open=false;
    const more=document.querySelector('#screen-mark .common-part-library'); if(more) more.open=false;
  }
  function writePanelName(name){
    name=String(name||'').trim();
    if(!name)return;
    const current=typeof part==='function'?part():null;
    state.lastChosenPartName=name;
    if(current) current.name=name;
    const picker=document.getElementById('partNamePicker'); if(picker) picker.value=name;
    const summary=document.getElementById('chosenPartSummary'); if(summary) summary.textContent=name;
    if(typeof save==='function') save();
    if(typeof renderForm==='function') renderForm();
    if(typeof renderPartList==='function') renderPartList();
    if(typeof renderParts==='function') renderParts();
    if(typeof renderCutting==='function') renderCutting();
    closePartMenus();
  }
  window.setPartName=writePanelName;
  try{setPartName=writePanelName}catch(e){}
  document.addEventListener('click',function(e){
    const button=e.target.closest&&e.target.closest('#screen-mark [data-quick-name]');
    if(!button)return;
    e.preventDefault();e.stopPropagation();
    writePanelName(button.dataset.quickName);
  },true);
  const picker=document.getElementById('partNamePicker');
  if(picker){
    const commit=()=>writePanelName(picker.value);
    picker.addEventListener('change',commit,true);
    picker.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commit();picker.blur()}},true);
  }
})();


// --- block 10 ---

(function(){
  function openQuickMenu(kind){
    const menu=document.getElementById('quick-'+kind);
    if(!menu)return;
    document.querySelectorAll('#screen-mark .quick-pop').forEach(x=>{if(x!==menu)x.classList.remove('open')});
    menu.classList.toggle('open');
  }
  document.addEventListener('click',function(e){
    const b=e.target.closest&&e.target.closest('#screen-mark .quick-main-btn[data-quick-menu]');
    if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();
    openQuickMenu(b.dataset.quickMenu);
  },true);

  let zoom=Number((window.state&&state.drawingZoom)||1)||1;
  function getFitSize(){
    const stage=document.getElementById('drawingStage');
    const img=document.getElementById('drawingImage');
    if(!stage)return {w:600,h:450};
    const aw=Math.max(120,stage.clientWidth-36), ah=Math.max(120,stage.clientHeight-36);
    let iw=img&&img.naturalWidth||aw, ih=img&&img.naturalHeight||ah;
    const ratio=Math.min(aw/iw,ah/ih,1);
    return {w:Math.max(180,Math.round(iw*ratio)),h:Math.max(180,Math.round(ih*ratio))};
  }
  function applyZoom(keepCentre){
    const stage=document.getElementById('drawingStage');
    const canvas=document.getElementById('drawingCanvas');
    if(!stage||!canvas)return;
    zoom=Math.max(.25,Math.min(4,Math.round(zoom*4)/4));
    if(window.state)state.drawingZoom=zoom;
    const centreX=stage.scrollLeft+stage.clientWidth/2, centreY=stage.scrollTop+stage.clientHeight/2;
    const oldW=canvas.offsetWidth||1, oldH=canvas.offsetHeight||1;
    const fit=getFitSize();
    canvas.style.setProperty('width',Math.round(fit.w*zoom)+'px','important');
    canvas.style.setProperty('height',Math.round(fit.h*zoom)+'px','important');
    const label=document.getElementById('zoomValue');if(label)label.textContent=Math.round(zoom*100)+'%';
    if(keepCentre){requestAnimationFrame(()=>{
      const rx=(fit.w*zoom)/oldW, ry=(fit.h*zoom)/oldH;
      stage.scrollLeft=Math.max(0,centreX*rx-stage.clientWidth/2);
      stage.scrollTop=Math.max(0,centreY*ry-stage.clientHeight/2);
    })}
  }
  document.addEventListener('click',function(e){
    const plus=e.target.closest&&e.target.closest('#zoomInBtn');
    const minus=e.target.closest&&e.target.closest('#zoomOutBtn');
    const fit=e.target.closest&&e.target.closest('#zoomFitBtn');
    if(!plus&&!minus&&!fit)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(plus)zoom+=.25;
    if(minus)zoom-=.25;
    if(fit)zoom=1;
    applyZoom(!fit);
    if(fit){const stage=document.getElementById('drawingStage');if(stage){stage.scrollLeft=0;stage.scrollTop=0}}
  },true);
  const observer=new MutationObserver(()=>{
    const img=document.getElementById('drawingImage');
    if(img&&!img.dataset.a105load){img.dataset.a105load='1';img.addEventListener('load',()=>{zoom=Number((window.state&&state.drawingZoom)||1)||1;requestAnimationFrame(()=>applyZoom(false))})}
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('resize',()=>applyZoom(false));
  setTimeout(()=>applyZoom(false),100);
})();


// --- block 11 ---

(function(){
 function hashRef(value){let h=2166136261;for(const ch of String(value||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(36).toUpperCase().slice(-5).padStart(5,'0')}
 window.assembleOneJobRef=function(pr){return 'J-'+hashRef(pr?.id||pr?.name||'JOB')}
 const oldRenderQr=window.renderQr;
 window.renderQr=function(){
   oldRenderQr();
   setTimeout(()=>{
     const pr=project(), ref=assembleOneJobRef(pr);
     document.querySelectorAll('.qr-card').forEach(card=>{
       if(card.querySelector('.ao-job-ref'))return;
       const h=card.querySelector('h3');if(!h)return;
       const d=document.createElement('div');d.className='ao-job-ref';d.textContent=`${ref} · ${pr?.name||'Project'}`;h.insertAdjacentElement('afterend',d);
     });
     document.querySelectorAll('.supplier-label').forEach(card=>{
       if(card.querySelector('.ao-job-ref'))return;
       const d=document.createElement('div');d.className='ao-job-ref';d.textContent=`${ref} · ${pr?.name||'Project'}`;
       const first=card.querySelector('div');if(first)first.appendChild(d);
     });
   },30);
 }
 window.openGuidePreviewForPanel=function(p){
   const modal=document.querySelector('#guidePreviewModal'),frame=document.querySelector('#guidePreviewFrame'),c=cabinet(),pr=project();if(!modal||!frame||!p)return;
   qrReturnScroll=window.scrollY||0;
   const ref=assembleOneJobRef(pr);
   const drawing=c?.drawing&&c.drawingType!=="pdf"?`<div class="drawing"><img src="${c.drawing}" alt="Highlighted panel drawing"><div class="highlight" style="left:${Number(p.x||50)}%;top:${Number(p.y||50)}%"><span>${safe(p.code)}</span></div></div>`:`<div class="missing">Drawing missing</div>`;
   frame.removeAttribute('src');
   frame.srcdoc=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:Arial,sans-serif;color:#272249;background:#f6f6f9}.wrap{padding:18px}.drawing{position:relative;background:#e9e5df;border-radius:18px;overflow:auto;min-height:360px;display:grid;place-items:center}.drawing img{display:block;max-width:100%;max-height:68vh}.highlight{position:absolute;transform:translate(-50%,-50%);width:82px;height:82px;border:7px solid #4c9138;border-radius:50%;background:rgba(76,145,56,.22);display:grid;place-items:center;animation:pulse 1.1s ease-in-out 3}.highlight span{background:#4c9138;color:#fff;border-radius:999px;padding:8px;font-weight:800}@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(76,145,56,.65)}50%{box-shadow:0 0 0 24px rgba(76,145,56,0)}}.card{background:#fff;border-radius:18px;padding:18px;margin-top:14px}.card h1{margin:0 0 10px;font-size:28px}.row{font-size:20px;margin:7px 0}.muted{color:#665f75}.job{font-weight:800;color:#765f00;background:#fff7d6;padding:10px;border-radius:12px;margin-bottom:12px}.missing{padding:50px;text-align:center}.back{display:block;width:100%;padding:16px;border:0;border-radius:14px;background:#ffc400;color:#272249;font-size:20px;font-weight:800;margin-top:14px}</style>
<style id="siteRoomDetailsStyles">
.site-room-modal{position:fixed;inset:0;background:rgba(24,20,45,.72);z-index:10050;display:none;align-items:center;justify-content:center;padding:18px}.site-room-modal.open{display:flex}.site-room-dialog{width:min(1180px,96vw);max-height:92vh;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 28px 80px rgba(20,17,42,.35);display:flex;flex-direction:column}.site-room-head{display:flex;align-items:center;gap:14px;padding:18px 22px;border-bottom:2px solid #eceaf2}.site-room-head .room-badge{font-size:42px}.site-room-head h2{margin:0;font-size:30px}.site-room-head p{margin:4px 0 0;color:#6d687d;font-weight:700}.site-room-close{margin-left:auto;width:50px;height:50px;border-radius:15px;border:2px solid #ddd9e8;background:#fff;font-size:30px;cursor:pointer}.site-room-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,.9fr);min-height:560px;overflow:auto}.site-reference-pane{padding:18px;border-right:2px solid #eceaf2;background:#f8f9fc}.site-reference-frame{background:#e9ebf1;border-radius:20px;min-height:420px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}.site-reference-frame img{max-width:100%;max-height:62vh;object-fit:contain}.site-reference-empty{font-size:24px;color:#777286;text-align:center;padding:30px}.site-thumb-row{display:flex;gap:10px;overflow:auto;padding-top:12px}.site-thumb{width:86px;height:68px;border:3px solid transparent;border-radius:12px;object-fit:cover;cursor:pointer;background:#eee}.site-thumb.active{border-color:#f1b900}.site-design-pane{padding:22px;display:flex;flex-direction:column;gap:15px}.site-facts{display:grid;grid-template-columns:1fr 1fr;gap:12px}.site-fact{border:2px solid #e4e1eb;border-radius:18px;padding:14px;background:#fff}.site-fact b{display:block;font-size:25px;color:#2d2854}.site-fact span{color:#6c677d;font-weight:750}.site-notes-box{border:2px solid #e4e1eb;border-radius:18px;padding:15px;min-height:90px}.site-notes-box h3{margin:0 0 8px;font-size:19px}.site-detail-actions{display:grid;gap:12px;margin-top:auto}.site-detail-actions .btn{min-height:60px;font-size:19px;border-radius:16px}.site-detail-actions .primary{background:#ffc400;color:#29234f;border-color:#dda900}.site-drawing-placeholder{border:3px dashed #cfcbd9;border-radius:22px;min-height:190px;display:flex;align-items:center;justify-content:center;text-align:center;color:#716c80;font-weight:800;font-size:20px;padding:25px}.site-job-tag{display:inline-flex;align-items:center;gap:8px;background:#eaf8ef;color:#12783c;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900;margin-top:7px}.folder-card.site-received{border-color:#31a65d;background:#f4fbf6}.folder-card .site-details-btn{border-color:#456fc4;background:#f3f6ff}
@media(max-width:760px){.site-room-modal{padding:7px}.site-room-dialog{width:100%;max-height:96vh;border-radius:20px}.site-room-body{grid-template-columns:1fr}.site-reference-pane{border-right:0;border-bottom:2px solid #eceaf2}.site-reference-frame{min-height:260px}.site-facts{grid-template-columns:1fr 1fr}.site-room-head h2{font-size:23px}}
</style>



<style id="v123-illustrated-homepage">
.v12-home{background:linear-gradient(180deg,#fff 0%,#fbfbfe 100%);padding:24px!important}
.v12-home-header{margin-bottom:18px}
.v12-home-header h2{font-size:34px;color:#171c46;letter-spacing:-.4px}
.v12-home-header p{font-size:17px;color:#666b84}
.v12-main-actions{gap:20px;margin-bottom:22px}
.v12-action-card.illustrated-card{min-height:210px;padding:0 24px 0 0;grid-template-columns:300px 1fr auto;gap:22px;overflow:hidden;border-width:2px;box-shadow:0 10px 28px rgba(39,42,84,.08)}
.v12-action-card.illustrated-card .v123-card-art{width:300px;height:210px;object-fit:cover;object-position:center;display:block;align-self:stretch;border-radius:20px 0 0 20px}
.v12-action-card.illustrated-card .v123-card-copy{align-self:center}
.v12-action-card.illustrated-card strong{font-size:29px;line-height:1.08;letter-spacing:-.3px}
.v12-action-card.illustrated-card small{font-size:18px;line-height:1.45;margin-top:12px;max-width:330px}
.v12-action-card.illustrated-card>b{font-size:48px}
.v12-green{background:#f5fff7;border-color:#9bddae}.v12-green strong,.v12-green>b{color:#089538}
.v12-blue{background:#f4f8ff;border-color:#9dbdff}.v12-blue strong,.v12-blue>b{color:#145ad4}
.v12-orange{background:#fff9f1;border-color:#ffc57a}.v12-orange strong,.v12-orange>b{color:#f06a00}
.v12-purple{background:#faf6ff;border-color:#c9a9ff}.v12-purple strong,.v12-purple>b{color:#6a2bd4}
.v12-site-jobs,.v12-recent-section{border-radius:24px;box-shadow:0 8px 24px rgba(39,42,84,.07)}
.site-jobs-cloud{font-size:34px;width:58px;height:58px;display:grid;place-items:center;border-radius:16px;background:linear-gradient(145deg,#3d7cff,#76a6ff);color:#fff;box-shadow:0 8px 18px rgba(61,124,255,.25)}
.v12-section-heading h3{font-size:25px;color:#171c46}
.v12-section-heading p{font-size:15px}
@media(max-width:1200px){.v12-action-card.illustrated-card{grid-template-columns:220px 1fr auto;min-height:175px}.v12-action-card.illustrated-card .v123-card-art{width:220px;height:175px}.v12-action-card.illustrated-card strong{font-size:24px}.v12-action-card.illustrated-card small{font-size:15px}}
@media(max-width:820px){.v12-action-card.illustrated-card{grid-template-columns:145px 1fr auto;min-height:140px}.v12-action-card.illustrated-card .v123-card-art{width:145px;height:140px}.v12-action-card.illustrated-card strong{font-size:21px}.v12-action-card.illustrated-card small{font-size:14px;margin-top:7px}}
@media(max-width:520px){.v12-home{padding:12px!important}.v12-action-card.illustrated-card{grid-template-columns:105px 1fr auto;min-height:118px;padding-right:13px;gap:12px}.v12-action-card.illustrated-card .v123-card-art{width:105px;height:118px}.v12-action-card.illustrated-card strong{font-size:18px}.v12-action-card.illustrated-card small{font-size:12px}.v12-action-card.illustrated-card>b{font-size:34px}}
</style>
</head><body><div class="wrap"><div class="job">Test scan: ${ref} · ${safe(pr?.name||'Project')} · ${safe(p.code)}</div>${drawing}<div class="card"><h1>${safe(p.code)} — ${safe(p.name||'Unnamed part')}</h1><div class="row"><strong>${p.length||'—'} × ${p.width||'—'} × ${p.thickness||'—'} mm</strong> · Qty ${p.qty||1}</div><div class="row"><strong>Material:</strong> ${safe(materialForPanel(p)||'Not set')}</div><div class="row"><strong>Edging:</strong> ${safe(edgeText(p))}</div><div class="row muted">${safe(p.notes||'')}</div><div class="row muted">${safe(c?.name||'')}</div></div><button class="back" onclick="parent.postMessage('assembleone-close-test','*')">Back to QR labels</button></div></body></html>`;
   modal.classList.add('open');modal.setAttribute('aria-hidden','false');
 }
 // Refresh the current page after installing the patched renderer.
 try{if(project())renderQr()}catch(e){}
})();


// --- block 12 ---

(function(){
  function toast(message,isError){
    const t=document.getElementById('a125QrToast');if(!t)return;
    t.textContent=message;t.style.background=isError?'#fff1f1':'#e9f8ed';t.style.borderColor=isError?'#e34a4a':'#55b873';t.style.color=isError?'#9b1c1c':'#08702d';t.classList.add('show');
    clearTimeout(window.__a125ToastTimer);window.__a125ToastTimer=setTimeout(()=>t.classList.remove('show'),2600);
  }
  function goToRealDrawing(panelId,copyIndex){
    const p=cabinetParts().find(x=>x.id===panelId),c=cabinet();
    if(!p){toast(st('common.panelNotFound'),true);return}
    if(!c?.drawing){toast(st('common.drawingMissingFor',[p.code]),true);return}
    const i=copyIndex!=null&&copyIndex!==''?Number(copyIndex):-1;
    state.currentPart=p.id;state.selectedCopy=(i>=0&&p.copies?.[i])?i:-1;state.focusMarker=true;save();renderAll();show('mark');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      const stage=document.getElementById('drawingStage');
      const pin=stage?.querySelector('.pin.selected');
      if(stage){
        stage.scrollIntoView({behavior:'smooth',block:'start'});
        if(pin){
          const stageRect=stage.getBoundingClientRect();
          const pinRect=pin.getBoundingClientRect();
          const targetLeft=stage.scrollLeft+(pinRect.left-stageRect.left)-stage.clientWidth/2+pinRect.width/2;
          const targetTop=stage.scrollTop+(pinRect.top-stageRect.top)-stage.clientHeight/2+pinRect.height/2;
          stage.scrollTo({left:Math.max(0,targetLeft),top:Math.max(0,targetTop),behavior:'smooth'});
          pin.classList.remove('a125-test-pulse');
          void pin.offsetWidth;
          pin.classList.add('a125-test-pulse');
          setTimeout(()=>pin.classList.remove('a125-test-pulse'),3300);
        }
      }
      toast(st('common.openedOnDrawing',[p.code]));
    }));
  }
  function installQrHandlers(){
    document.querySelectorAll('#qrGrid [data-test]').forEach(btn=>{
      btn.onclick=function(e){e.preventDefault();e.stopPropagation();goToRealDrawing(btn.dataset.test)};
    });
  }
  const baseRenderQr=window.renderQr;
  window.renderQr=function(){
    baseRenderQr();
    const p=project();if(p){p.qrReady=true;save()}
    setTimeout(installQrHandlers,80);
  };
  function printableQrHtml(){
    const cards=[...document.querySelectorAll('#qrGrid .qr-card')];
    if(!cards.length)return '';
    const cloned=cards.map(card=>{
      const copy=card.cloneNode(true);
      copy.querySelectorAll('button,.qr-test-result').forEach(x=>x.remove());
      const originalCanvas=card.querySelector('canvas');
      if(originalCanvas){const img=document.createElement('img');img.src=originalCanvas.toDataURL('image/png');img.style.width='150px';img.style.height='150px';copy.querySelector('canvas')?.replaceWith(img)}
      return copy.outerHTML;
    }).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>AssembleOne QR Labels</title><style>@page{margin:10mm}body{font-family:Arial,sans-serif;color:#272249;margin:0}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10mm}.qr-card{border:1px solid #d8d5e1;border-radius:12px;padding:10px;text-align:center;break-inside:avoid}.qr-card img,.qr-card canvas{width:150px!important;height:150px!important}.qr-card h3{font-size:22px;margin:7px 0}.qr-meta{font-size:12px;line-height:1.4}@media(max-width:800px){.grid{grid-template-columns:repeat(2,1fr)}}</style>
<style id="siteRoomDetailsStyles">
.site-room-modal{position:fixed;inset:0;background:rgba(24,20,45,.72);z-index:10050;display:none;align-items:center;justify-content:center;padding:18px}.site-room-modal.open{display:flex}.site-room-dialog{width:min(1180px,96vw);max-height:92vh;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 28px 80px rgba(20,17,42,.35);display:flex;flex-direction:column}.site-room-head{display:flex;align-items:center;gap:14px;padding:18px 22px;border-bottom:2px solid #eceaf2}.site-room-head .room-badge{font-size:42px}.site-room-head h2{margin:0;font-size:30px}.site-room-head p{margin:4px 0 0;color:#6d687d;font-weight:700}.site-room-close{margin-left:auto;width:50px;height:50px;border-radius:15px;border:2px solid #ddd9e8;background:#fff;font-size:30px;cursor:pointer}.site-room-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,.9fr);min-height:560px;overflow:auto}.site-reference-pane{padding:18px;border-right:2px solid #eceaf2;background:#f8f9fc}.site-reference-frame{background:#e9ebf1;border-radius:20px;min-height:420px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}.site-reference-frame img{max-width:100%;max-height:62vh;object-fit:contain}.site-reference-empty{font-size:24px;color:#777286;text-align:center;padding:30px}.site-thumb-row{display:flex;gap:10px;overflow:auto;padding-top:12px}.site-thumb{width:86px;height:68px;border:3px solid transparent;border-radius:12px;object-fit:cover;cursor:pointer;background:#eee}.site-thumb.active{border-color:#f1b900}.site-design-pane{padding:22px;display:flex;flex-direction:column;gap:15px}.site-facts{display:grid;grid-template-columns:1fr 1fr;gap:12px}.site-fact{border:2px solid #e4e1eb;border-radius:18px;padding:14px;background:#fff}.site-fact b{display:block;font-size:25px;color:#2d2854}.site-fact span{color:#6c677d;font-weight:750}.site-notes-box{border:2px solid #e4e1eb;border-radius:18px;padding:15px;min-height:90px}.site-notes-box h3{margin:0 0 8px;font-size:19px}.site-detail-actions{display:grid;gap:12px;margin-top:auto}.site-detail-actions .btn{min-height:60px;font-size:19px;border-radius:16px}.site-detail-actions .primary{background:#ffc400;color:#29234f;border-color:#dda900}.site-drawing-placeholder{border:3px dashed #cfcbd9;border-radius:22px;min-height:190px;display:flex;align-items:center;justify-content:center;text-align:center;color:#716c80;font-weight:800;font-size:20px;padding:25px}.site-job-tag{display:inline-flex;align-items:center;gap:8px;background:#eaf8ef;color:#12783c;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900;margin-top:7px}.folder-card.site-received{border-color:#31a65d;background:#f4fbf6}.folder-card .site-details-btn{border-color:#456fc4;background:#f3f6ff}
@media(max-width:760px){.site-room-modal{padding:7px}.site-room-dialog{width:100%;max-height:96vh;border-radius:20px}.site-room-body{grid-template-columns:1fr}.site-reference-pane{border-right:0;border-bottom:2px solid #eceaf2}.site-reference-frame{min-height:260px}.site-facts{grid-template-columns:1fr 1fr}.site-room-head h2{font-size:23px}}
</style>



<style id="v123-illustrated-homepage">
.v12-home{background:linear-gradient(180deg,#fff 0%,#fbfbfe 100%);padding:24px!important}
.v12-home-header{margin-bottom:18px}
.v12-home-header h2{font-size:34px;color:#171c46;letter-spacing:-.4px}
.v12-home-header p{font-size:17px;color:#666b84}
.v12-main-actions{gap:20px;margin-bottom:22px}
.v12-action-card.illustrated-card{min-height:210px;padding:0 24px 0 0;grid-template-columns:300px 1fr auto;gap:22px;overflow:hidden;border-width:2px;box-shadow:0 10px 28px rgba(39,42,84,.08)}
.v12-action-card.illustrated-card .v123-card-art{width:300px;height:210px;object-fit:cover;object-position:center;display:block;align-self:stretch;border-radius:20px 0 0 20px}
.v12-action-card.illustrated-card .v123-card-copy{align-self:center}
.v12-action-card.illustrated-card strong{font-size:29px;line-height:1.08;letter-spacing:-.3px}
.v12-action-card.illustrated-card small{font-size:18px;line-height:1.45;margin-top:12px;max-width:330px}
.v12-action-card.illustrated-card>b{font-size:48px}
.v12-green{background:#f5fff7;border-color:#9bddae}.v12-green strong,.v12-green>b{color:#089538}
.v12-blue{background:#f4f8ff;border-color:#9dbdff}.v12-blue strong,.v12-blue>b{color:#145ad4}
.v12-orange{background:#fff9f1;border-color:#ffc57a}.v12-orange strong,.v12-orange>b{color:#f06a00}
.v12-purple{background:#faf6ff;border-color:#c9a9ff}.v12-purple strong,.v12-purple>b{color:#6a2bd4}
.v12-site-jobs,.v12-recent-section{border-radius:24px;box-shadow:0 8px 24px rgba(39,42,84,.07)}
.site-jobs-cloud{font-size:34px;width:58px;height:58px;display:grid;place-items:center;border-radius:16px;background:linear-gradient(145deg,#3d7cff,#76a6ff);color:#fff;box-shadow:0 8px 18px rgba(61,124,255,.25)}
.v12-section-heading h3{font-size:25px;color:#171c46}
.v12-section-heading p{font-size:15px}
@media(max-width:1200px){.v12-action-card.illustrated-card{grid-template-columns:220px 1fr auto;min-height:175px}.v12-action-card.illustrated-card .v123-card-art{width:220px;height:175px}.v12-action-card.illustrated-card strong{font-size:24px}.v12-action-card.illustrated-card small{font-size:15px}}
@media(max-width:820px){.v12-action-card.illustrated-card{grid-template-columns:145px 1fr auto;min-height:140px}.v12-action-card.illustrated-card .v123-card-art{width:145px;height:140px}.v12-action-card.illustrated-card strong{font-size:21px}.v12-action-card.illustrated-card small{font-size:14px;margin-top:7px}}
@media(max-width:520px){.v12-home{padding:12px!important}.v12-action-card.illustrated-card{grid-template-columns:105px 1fr auto;min-height:118px;padding-right:13px;gap:12px}.v12-action-card.illustrated-card .v123-card-art{width:105px;height:118px}.v12-action-card.illustrated-card strong{font-size:18px}.v12-action-card.illustrated-card small{font-size:12px}.v12-action-card.illustrated-card>b{font-size:34px}}
</style>
</head><body><div class="grid">`+cloned+'</div><script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script></body></html>';
  }
  function printQrLabels(){
    if(!document.querySelector('#qrGrid .qr-card')){renderQr();setTimeout(printQrLabels,150);return}
    const html=printableQrHtml();if(!html){toast(st('msg.generateQrCodesFirst'),true);return}
    const w=window.open('','_blank');
    if(!w){toast(st('common.allowPopupsPrintQr'),true);return}
    w.document.open();w.document.write(html);w.document.close();
  }
  const gen=document.getElementById('generateQrBtn');
  if(gen)gen.onclick=function(e){e.preventDefault();renderQr();toast(st('common.qrCodesGenerated'))};
  const print=document.getElementById('printQrBtn');
  if(print)print.onclick=function(e){e.preventDefault();printQrLabels()};
  document.addEventListener('click',e=>{
    const b=e.target.closest('#qrGrid [data-test]');if(!b)return;
    e.preventDefault();e.stopImmediatePropagation();goToRealDrawing(b.dataset.test,b.dataset.copy);
  },true);
  if(state?.screen==='qr')setTimeout(()=>{renderQr();installQrHandlers()},100);
})();


// --- block 13 ---

(function(){
 const escCsv=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
 const SUPPLIER_I18N={
  en:{
   pageTitle:'Supplier',pageSubtitle:'Final cutting information and matching QR stickers.',
   langLabel:'Language',
   checkingPanels:'Checking panels…',readyToManufacture:'Ready to manufacture',
   panelNeedsChecking:'panel needs checking',panelsNeedChecking:'panels need checking',
   completePanels:'Complete panels',totalPieces:'Total pieces',materials:'Materials',
   piece:'piece',pieces:'pieces',noCompleteMaterials:'No complete materials yet.',
   unnamedPart:'Unnamed part',quantity:'Quantity',noCompletePanels:'No complete panels ready for the supplier.',
   deliveryHeading:'📍 Delivery location',openInMaps:'📍 Open in Maps',
   pinnedNoAddress:'Pinned map location (no typed address)',
   includeDelivery:'Include delivery location',
   deliveryHintAddress:'Add "{address}" to the cutting list, for suppliers delivering material direct.',
   deliveryHintDefault:'Add the pinned map location to the cutting list, for suppliers delivering material direct.',
   downloadCsvTitle:'Download CSV',downloadCsvSub:'Excel and CNC suppliers',
   printPackTitle:'Print Supplier Pack',printPackSub:'Cutting list + matching QR stickers',
   sendToPhoneTitle:'Send Cutting List to Phone',sendToPhoneSub:'Panels, quantities and QR scan checklist',
   panelsHeading:'Panels',
   stickerSizeHeading:'QR sticker size',stickerSizeSub:'Choose a common size or enter your own measurements.',
   widthLabel:'Width mm',heightLabel:'Height mm',
   stickerPreviewHeading:'Sticker preview',
   longEdge:'long edge',longEdges:'long edges',shortEdge:'short edge',shortEdges:'short edges',
   noLongEdging:'No long edging',noShortEdging:'No short edging',
   cuttingTitle:'Supplier Cutting List',stickersTitle:'Supplier QR Stickers',
   qty:'Qty',material:'Material:',notSet:'Not set',edging:'Edging:',notes:'Notes:',project:'Project',unit:'Unit',
   csvHeaderPanelNo:'Panel No.',csvHeaderPartName:'Part name',csvHeaderThickness:'Thickness mm',csvHeaderLength:'Length mm',csvHeaderWidth:'Width mm',csvHeaderLongEdges:'Long edges',csvHeaderShortEdges:'Short edges',csvHeaderMaterial:'Material',csvHeaderNotes:'Notes',deliverToCsv:'Deliver to',noCompletePanelsExport:'No complete panels are ready to export.',creatingCsv:'Creating CSV…',csvExported:'✓ CSV exported',csvExportFailed:'CSV export failed.',printBlocked:'Print window was blocked. Allow popups for this file.',
   noCompletePanelsPrint:'No complete panels are ready to print.',buildingSupplierPack:'Building supplier pack…',deliverToLabel:'Deliver to:',seeMapLink:'See map link',supplierPackReadyPrint:'✓ Supplier pack ready to print',supplierPackCouldNotCreate:'Supplier pack could not be created.',supplierPackPrintTitle:'Supplier Pack'
  },
  es:{
   pageTitle:'Proveedor',pageSubtitle:'Información final de corte y etiquetas QR correspondientes.',
   langLabel:'Idioma',
   checkingPanels:'Revisando paneles…',readyToManufacture:'Listo para fabricar',
   panelNeedsChecking:'panel necesita revisión',panelsNeedChecking:'paneles necesitan revisión',
   completePanels:'Paneles completos',totalPieces:'Piezas totales',materials:'Materiales',
   piece:'pieza',pieces:'piezas',noCompleteMaterials:'Aún no hay materiales completos.',
   unnamedPart:'Pieza sin nombre',quantity:'Cantidad',noCompletePanels:'No hay paneles completos listos para el proveedor.',
   deliveryHeading:'📍 Ubicación de entrega',openInMaps:'📍 Abrir en Maps',
   pinnedNoAddress:'Ubicación marcada en el mapa (sin dirección escrita)',
   includeDelivery:'Incluir ubicación de entrega',
   deliveryHintAddress:'Agregar "{address}" a la lista de corte, para proveedores que entregan material directamente.',
   deliveryHintDefault:'Agregar la ubicación marcada en el mapa a la lista de corte, para proveedores que entregan material directamente.',
   downloadCsvTitle:'Descargar CSV',downloadCsvSub:'Excel y proveedores CNC',
   printPackTitle:'Imprimir paquete para proveedor',printPackSub:'Lista de corte + etiquetas QR correspondientes',
   sendToPhoneTitle:'Enviar lista de corte al teléfono',sendToPhoneSub:'Paneles, cantidades y lista de verificación QR',
   panelsHeading:'Paneles',
   stickerSizeHeading:'Tamaño de etiqueta QR',stickerSizeSub:'Elige un tamaño común o ingresa tus propias medidas.',
   widthLabel:'Ancho mm',heightLabel:'Alto mm',
   stickerPreviewHeading:'Vista previa de etiquetas',
   longEdge:'canto largo',longEdges:'cantos largos',shortEdge:'canto corto',shortEdges:'cantos cortos',
   noLongEdging:'Sin canto largo',noShortEdging:'Sin canto corto',
   cuttingTitle:'Lista de Corte para Proveedor',stickersTitle:'Etiquetas QR para Proveedor',
   qty:'Cant.',material:'Material:',notSet:'No definido',edging:'Cantos:',notes:'Notas:',project:'Proyecto',unit:'Unidad',
   csvHeaderPanelNo:'N.º de panel',csvHeaderPartName:'Nombre de la pieza',csvHeaderThickness:'Grosor mm',csvHeaderLength:'Longitud mm',csvHeaderWidth:'Ancho mm',csvHeaderLongEdges:'Cantos largos',csvHeaderShortEdges:'Cantos cortos',csvHeaderMaterial:'Material',csvHeaderNotes:'Notas',deliverToCsv:'Entregar a',noCompletePanelsExport:'No hay paneles completos listos para exportar.',creatingCsv:'Creando CSV…',csvExported:'✓ CSV exportado',csvExportFailed:'Error al exportar el CSV.',printBlocked:'La ventana de impresión fue bloqueada. Permite las ventanas emergentes para este archivo.',
   noCompletePanelsPrint:'No hay paneles completos listos para imprimir.',buildingSupplierPack:'Creando paquete para el proveedor…',deliverToLabel:'Entregar a:',seeMapLink:'Ver enlace del mapa',supplierPackReadyPrint:'✓ Paquete para el proveedor listo para imprimir',supplierPackCouldNotCreate:'No se pudo crear el paquete para el proveedor.',supplierPackPrintTitle:'Paquete para el proveedor'
  },
  fr:{
   pageTitle:'Fournisseur',pageSubtitle:'Informations finales de découpe et étiquettes QR correspondantes.',
   langLabel:'Langue',
   checkingPanels:'Vérification des panneaux…',readyToManufacture:'Prêt à fabriquer',
   panelNeedsChecking:'panneau à vérifier',panelsNeedChecking:'panneaux à vérifier',
   completePanels:'Panneaux complets',totalPieces:'Pièces totales',materials:'Matériaux',
   piece:'pièce',pieces:'pièces',noCompleteMaterials:'Aucun matériau complet pour le moment.',
   unnamedPart:'Pièce sans nom',quantity:'Quantité',noCompletePanels:'Aucun panneau complet prêt pour le fournisseur.',
   deliveryHeading:'📍 Lieu de livraison',openInMaps:'📍 Ouvrir dans Maps',
   pinnedNoAddress:'Emplacement épinglé sur la carte (sans adresse saisie)',
   includeDelivery:'Inclure le lieu de livraison',
   deliveryHintAddress:'Ajouter "{address}" à la liste de découpe, pour les fournisseurs livrant le matériel directement.',
   deliveryHintDefault:"Ajouter l'emplacement épinglé sur la carte à la liste de découpe, pour les fournisseurs livrant le matériel directement.",
   downloadCsvTitle:'Télécharger le CSV',downloadCsvSub:'Excel et fournisseurs CNC',
   printPackTitle:'Imprimer le dossier fournisseur',printPackSub:'Liste de découpe + étiquettes QR correspondantes',
   sendToPhoneTitle:'Envoyer la liste de découpe au téléphone',sendToPhoneSub:'Panneaux, quantités et liste de contrôle QR',
   panelsHeading:'Panneaux',
   stickerSizeHeading:'Taille des étiquettes QR',stickerSizeSub:'Choisissez une taille courante ou saisissez vos propres mesures.',
   widthLabel:'Largeur mm',heightLabel:'Hauteur mm',
   stickerPreviewHeading:'Aperçu des étiquettes',
   longEdge:'chant long',longEdges:'chants longs',shortEdge:'chant court',shortEdges:'chants courts',
   noLongEdging:'Aucun chant long',noShortEdging:'Aucun chant court',
   cuttingTitle:'Liste de Découpe pour le Fournisseur',stickersTitle:'Étiquettes QR pour le Fournisseur',
   qty:'Qté',material:'Matériau :',notSet:'Non défini',edging:'Chants :',notes:'Notes :',project:'Projet',unit:'Unité',
   csvHeaderPanelNo:'N° de panneau',csvHeaderPartName:'Nom de la pièce',csvHeaderThickness:'Épaisseur mm',csvHeaderLength:'Longueur mm',csvHeaderWidth:'Largeur mm',csvHeaderLongEdges:'Chants longs',csvHeaderShortEdges:'Chants courts',csvHeaderMaterial:'Matériau',csvHeaderNotes:'Notes',deliverToCsv:'Livrer à',noCompletePanelsExport:'Aucun panneau complet prêt à exporter.',creatingCsv:'Création du CSV…',csvExported:'✓ CSV exporté',csvExportFailed:"Échec de l'exportation du CSV.",printBlocked:"La fenêtre d'impression a été bloquée. Autorisez les pop-ups pour ce fichier.",
   noCompletePanelsPrint:"Aucun panneau complet n'est prêt à être imprimé.",buildingSupplierPack:'Création du dossier fournisseur…',deliverToLabel:'Livrer à :',seeMapLink:'Voir le lien de la carte',supplierPackReadyPrint:'✓ Dossier fournisseur prêt à imprimer',supplierPackCouldNotCreate:"Le dossier fournisseur n'a pas pu être créé.",supplierPackPrintTitle:'Dossier fournisseur'
  },
  de:{
   pageTitle:'Lieferant',pageSubtitle:'Endgültige Zuschnittinformationen und passende QR-Etiketten.',
   langLabel:'Sprache',
   checkingPanels:'Paneele werden geprüft…',readyToManufacture:'Bereit zur Fertigung',
   panelNeedsChecking:'Paneel muss geprüft werden',panelsNeedChecking:'Paneele müssen geprüft werden',
   completePanels:'Vollständige Paneele',totalPieces:'Stück gesamt',materials:'Materialien',
   piece:'Stück',pieces:'Stück',noCompleteMaterials:'Noch keine vollständigen Materialien.',
   unnamedPart:'Unbenanntes Teil',quantity:'Menge',noCompletePanels:'Keine vollständigen Paneele für den Lieferanten bereit.',
   deliveryHeading:'📍 Lieferort',openInMaps:'📍 In Maps öffnen',
   pinnedNoAddress:'Angepinnter Kartenstandort (keine Adresse eingegeben)',
   includeDelivery:'Lieferort einschließen',
   deliveryHintAddress:'Fügen Sie "{address}" der Zuschnittliste hinzu, für Lieferanten, die Material direkt liefern.',
   deliveryHintDefault:'Fügen Sie den angepinnten Kartenstandort der Zuschnittliste hinzu, für Lieferanten, die Material direkt liefern.',
   downloadCsvTitle:'CSV herunterladen',downloadCsvSub:'Excel und CNC-Lieferanten',
   printPackTitle:'Lieferantenpaket drucken',printPackSub:'Zuschnittliste + passende QR-Etiketten',
   sendToPhoneTitle:'Zuschnittliste an Telefon senden',sendToPhoneSub:'Paneele, Mengen und QR-Scan-Checkliste',
   panelsHeading:'Paneele',
   stickerSizeHeading:'QR-Etikettengröße',stickerSizeSub:'Wählen Sie eine gängige Größe oder geben Sie eigene Maße ein.',
   widthLabel:'Breite mm',heightLabel:'Höhe mm',
   stickerPreviewHeading:'Etikettenvorschau',
   longEdge:'lange Kante',longEdges:'lange Kanten',shortEdge:'kurze Kante',shortEdges:'kurze Kanten',
   noLongEdging:'Keine lange Kante',noShortEdging:'Keine kurze Kante',
   cuttingTitle:'Zuschnittliste für den Lieferanten',stickersTitle:'QR-Etiketten für den Lieferanten',
   qty:'Menge',material:'Material:',notSet:'Nicht festgelegt',edging:'Kantung:',notes:'Notizen:',project:'Projekt',unit:'Einheit',
   csvHeaderPanelNo:'Paneel-Nr.',csvHeaderPartName:'Teilename',csvHeaderThickness:'Stärke mm',csvHeaderLength:'Länge mm',csvHeaderWidth:'Breite mm',csvHeaderLongEdges:'Lange Kanten',csvHeaderShortEdges:'Kurze Kanten',csvHeaderMaterial:'Material',csvHeaderNotes:'Notizen',deliverToCsv:'Liefern an',noCompletePanelsExport:'Keine vollständigen Paneele zum Exportieren bereit.',creatingCsv:'CSV wird erstellt…',csvExported:'✓ CSV exportiert',csvExportFailed:'CSV-Export fehlgeschlagen.',printBlocked:'Das Druckfenster wurde blockiert. Erlaube Pop-ups für diese Datei.',
   noCompletePanelsPrint:'Keine vollständigen Paneele sind druckbereit.',buildingSupplierPack:'Lieferantenpaket wird erstellt…',deliverToLabel:'Liefern an:',seeMapLink:'Kartenlink ansehen',supplierPackReadyPrint:'✓ Lieferantenpaket bereit zum Drucken',supplierPackCouldNotCreate:'Lieferantenpaket konnte nicht erstellt werden.',supplierPackPrintTitle:'Lieferantenpaket'
  },
  da:{
   pageTitle:'Leverandør',pageSubtitle:'Endelige skæreoplysninger og tilhørende QR-mærkater.',
   langLabel:'Sprog',
   checkingPanels:'Tjekker paneler…',readyToManufacture:'Klar til fremstilling',
   panelNeedsChecking:'panel skal tjekkes',panelsNeedChecking:'paneler skal tjekkes',
   completePanels:'Færdige paneler',totalPieces:'Stykker i alt',materials:'Materialer',
   piece:'stk',pieces:'stk',noCompleteMaterials:'Ingen færdige materialer endnu.',
   unnamedPart:'Unavngivet del',quantity:'Antal',noCompletePanels:'Ingen færdige paneler klar til leverandøren.',
   deliveryHeading:'📍 Leveringssted',openInMaps:'📍 Åbn i Maps',
   pinnedNoAddress:'Fastgjort kortplacering (ingen indtastet adresse)',
   includeDelivery:'Inkluder leveringssted',
   deliveryHintAddress:'Tilføj "{address}" til skærelisten, for leverandører der leverer materiale direkte.',
   deliveryHintDefault:'Tilføj den fastgjorte kortplacering til skærelisten, for leverandører der leverer materiale direkte.',
   downloadCsvTitle:'Download CSV',downloadCsvSub:'Excel og CNC-leverandører',
   printPackTitle:'Udskriv leverandørpakke',printPackSub:'Skæreliste + tilhørende QR-mærkater',
   sendToPhoneTitle:'Send skæreliste til telefonen',sendToPhoneSub:'Paneler, antal og QR-scan-tjekliste',
   panelsHeading:'Paneler',
   stickerSizeHeading:'QR-mærkatstørrelse',stickerSizeSub:'Vælg en almindelig størrelse, eller angiv dine egne mål.',
   widthLabel:'Bredde mm',heightLabel:'Højde mm',
   stickerPreviewHeading:'Forhåndsvisning af mærkat',
   longEdge:'lang kant',longEdges:'lange kanter',shortEdge:'kort kant',shortEdges:'korte kanter',
   noLongEdging:'Ingen lang kant',noShortEdging:'Ingen kort kant',
   cuttingTitle:'Skæreliste til Leverandør',stickersTitle:'QR-mærkater til Leverandør',
   qty:'Antal',material:'Materiale:',notSet:'Ikke angivet',edging:'Kantliste:',notes:'Noter:',project:'Projekt',unit:'Enhed',
   csvHeaderPanelNo:'Panelnr.',csvHeaderPartName:'Delnavn',csvHeaderThickness:'Tykkelse mm',csvHeaderLength:'Længde mm',csvHeaderWidth:'Bredde mm',csvHeaderLongEdges:'Lange kanter',csvHeaderShortEdges:'Korte kanter',csvHeaderMaterial:'Materiale',csvHeaderNotes:'Noter',deliverToCsv:'Leveres til',noCompletePanelsExport:'Ingen komplette paneler klar til eksport.',creatingCsv:'Opretter CSV…',csvExported:'✓ CSV eksporteret',csvExportFailed:'CSV-eksport mislykkedes.',printBlocked:'Udskriftsvinduet blev blokeret. Tillad pop-ups for denne fil.',
   noCompletePanelsPrint:'Ingen komplette paneler er klar til udskrivning.',buildingSupplierPack:'Opretter leverandørpakke…',deliverToLabel:'Leveres til:',seeMapLink:'Se kortlink',supplierPackReadyPrint:'✓ Leverandørpakke klar til udskrivning',supplierPackCouldNotCreate:'Leverandørpakken kunne ikke oprettes.',supplierPackPrintTitle:'Leverandørpakke'
  },
  ro:{
   pageTitle:'Furnizor',pageSubtitle:'Informații finale de debitare și etichete QR corespunzătoare.',
   langLabel:'Limbă',
   checkingPanels:'Se verifică panourile…',readyToManufacture:'Gata pentru fabricare',
   panelNeedsChecking:'panou de verificat',panelsNeedChecking:'panouri de verificat',
   completePanels:'Panouri complete',totalPieces:'Total bucăți',materials:'Materiale',
   piece:'bucată',pieces:'bucăți',noCompleteMaterials:'Încă nu există materiale complete.',
   unnamedPart:'Piesă fără nume',quantity:'Cantitate',noCompletePanels:'Niciun panou complet gata pentru furnizor.',
   deliveryHeading:'📍 Locația de livrare',openInMaps:'📍 Deschide în Maps',
   pinnedNoAddress:'Locație marcată pe hartă (fără adresă introdusă)',
   includeDelivery:'Include locația de livrare',
   deliveryHintAddress:'Adaugă "{address}" la lista de debitare, pentru furnizorii care livrează materialul direct.',
   deliveryHintDefault:'Adaugă locația marcată pe hartă la lista de debitare, pentru furnizorii care livrează materialul direct.',
   downloadCsvTitle:'Descarcă CSV',downloadCsvSub:'Excel și furnizori CNC',
   printPackTitle:'Tipărește pachetul pentru furnizor',printPackSub:'Listă de debitare + etichete QR corespunzătoare',
   sendToPhoneTitle:'Trimite lista de debitare pe telefon',sendToPhoneSub:'Panouri, cantități și listă de verificare QR',
   panelsHeading:'Panouri',
   stickerSizeHeading:'Dimensiune etichetă QR',stickerSizeSub:'Alege o dimensiune obișnuită sau introdu propriile măsurători.',
   widthLabel:'Lățime mm',heightLabel:'Înălțime mm',
   stickerPreviewHeading:'Previzualizare etichetă',
   longEdge:'cant lung',longEdges:'canturi lungi',shortEdge:'cant scurt',shortEdges:'canturi scurte',
   noLongEdging:'Fără cant lung',noShortEdging:'Fără cant scurt',
   cuttingTitle:'Listă de Debitare pentru Furnizor',stickersTitle:'Etichete QR pentru Furnizor',
   qty:'Cant.',material:'Material:',notSet:'Nesetat',edging:'Cant:',notes:'Note:',project:'Proiect',unit:'Unitate',
   csvHeaderPanelNo:'Nr. panou',csvHeaderPartName:'Numele piesei',csvHeaderThickness:'Grosime mm',csvHeaderLength:'Lungime mm',csvHeaderWidth:'Lățime mm',csvHeaderLongEdges:'Canturi lungi',csvHeaderShortEdges:'Canturi scurte',csvHeaderMaterial:'Material',csvHeaderNotes:'Note',deliverToCsv:'Livrează la',noCompletePanelsExport:'Niciun panou complet gata de exportat.',creatingCsv:'Se creează CSV…',csvExported:'✓ CSV exportat',csvExportFailed:'Exportul CSV a eșuat.',printBlocked:'Fereastra de tipărire a fost blocată. Permite ferestre pop-up pentru acest fișier.',
   noCompletePanelsPrint:'Niciun panou complet nu este gata de tipărit.',buildingSupplierPack:'Se construiește pachetul pentru furnizor…',deliverToLabel:'Livrează la:',seeMapLink:'Vezi linkul hărții',supplierPackReadyPrint:'✓ Pachetul pentru furnizor este gata de tipărit',supplierPackCouldNotCreate:'Pachetul pentru furnizor nu a putut fi creat.',supplierPackPrintTitle:'Pachet pentru furnizor'
  },
  it:{
   pageTitle:'Fornitore',pageSubtitle:'Informazioni finali di taglio ed etichette QR corrispondenti.',
   langLabel:'Lingua',
   checkingPanels:'Controllo pannelli…',readyToManufacture:'Pronto per la produzione',
   panelNeedsChecking:'pannello da controllare',panelsNeedChecking:'pannelli da controllare',
   completePanels:'Pannelli completi',totalPieces:'Pezzi totali',materials:'Materiali',
   piece:'pezzo',pieces:'pezzi',noCompleteMaterials:'Ancora nessun materiale completo.',
   unnamedPart:'Pezzo senza nome',quantity:'Quantità',noCompletePanels:'Nessun pannello completo pronto per il fornitore.',
   deliveryHeading:'📍 Luogo di consegna',openInMaps:'📍 Apri in Maps',
   pinnedNoAddress:'Posizione segnata sulla mappa (nessun indirizzo digitato)',
   includeDelivery:'Includi il luogo di consegna',
   deliveryHintAddress:'Aggiungi "{address}" alla lista di taglio, per i fornitori che consegnano il materiale direttamente.',
   deliveryHintDefault:'Aggiungi la posizione segnata sulla mappa alla lista di taglio, per i fornitori che consegnano il materiale direttamente.',
   downloadCsvTitle:'Scarica CSV',downloadCsvSub:'Excel e fornitori CNC',
   printPackTitle:'Stampa pacchetto fornitore',printPackSub:'Lista di taglio + etichette QR corrispondenti',
   sendToPhoneTitle:'Invia lista di taglio al telefono',sendToPhoneSub:'Pannelli, quantità e lista di controllo QR',
   panelsHeading:'Pannelli',
   stickerSizeHeading:'Dimensione etichetta QR',stickerSizeSub:'Scegli una dimensione comune o inserisci le tue misure.',
   widthLabel:'Larghezza mm',heightLabel:'Altezza mm',
   stickerPreviewHeading:"Anteprima dell'etichetta",
   longEdge:'bordo lungo',longEdges:'bordi lunghi',shortEdge:'bordo corto',shortEdges:'bordi corti',
   noLongEdging:'Nessun bordo lungo',noShortEdging:'Nessun bordo corto',
   cuttingTitle:'Lista di Taglio per il Fornitore',stickersTitle:'Etichette QR per il Fornitore',
   qty:'Q.tà',material:'Materiale:',notSet:'Non impostato',edging:'Bordatura:',notes:'Note:',project:'Progetto',unit:'Unità',
   csvHeaderPanelNo:'N. pannello',csvHeaderPartName:'Nome del pezzo',csvHeaderThickness:'Spessore mm',csvHeaderLength:'Lunghezza mm',csvHeaderWidth:'Larghezza mm',csvHeaderLongEdges:'Bordi lunghi',csvHeaderShortEdges:'Bordi corti',csvHeaderMaterial:'Materiale',csvHeaderNotes:'Note',deliverToCsv:'Consegnare a',noCompletePanelsExport:"Nessun pannello completo pronto per l'esportazione.",creatingCsv:'Creazione CSV…',csvExported:'✓ CSV esportato',csvExportFailed:'Esportazione CSV non riuscita.',printBlocked:'La finestra di stampa è stata bloccata. Consenti i popup per questo file.',
   noCompletePanelsPrint:'Nessun pannello completo è pronto per la stampa.',buildingSupplierPack:'Creazione del pacchetto fornitore…',deliverToLabel:'Consegnare a:',seeMapLink:'Vedi il link della mappa',supplierPackReadyPrint:'✓ Pacchetto fornitore pronto per la stampa',supplierPackCouldNotCreate:'Impossibile creare il pacchetto fornitore.',supplierPackPrintTitle:'Pacchetto fornitore'
  },
  pt:{
   pageTitle:'Fornecedor',pageSubtitle:'Informações finais de corte e etiquetas QR correspondentes.',
   langLabel:'Idioma',
   checkingPanels:'A verificar painéis…',readyToManufacture:'Pronto para fabricar',
   panelNeedsChecking:'painel a verificar',panelsNeedChecking:'painéis a verificar',
   completePanels:'Painéis completos',totalPieces:'Total de peças',materials:'Materiais',
   piece:'peça',pieces:'peças',noCompleteMaterials:'Ainda não há materiais completos.',
   unnamedPart:'Peça sem nome',quantity:'Quantidade',noCompletePanels:'Nenhum painel completo pronto para o fornecedor.',
   deliveryHeading:'📍 Local de entrega',openInMaps:'📍 Abrir no Maps',
   pinnedNoAddress:'Local marcado no mapa (sem morada digitada)',
   includeDelivery:'Incluir local de entrega',
   deliveryHintAddress:'Adicionar "{address}" à lista de corte, para fornecedores que entregam material diretamente.',
   deliveryHintDefault:'Adicionar o local marcado no mapa à lista de corte, para fornecedores que entregam material diretamente.',
   downloadCsvTitle:'Descarregar CSV',downloadCsvSub:'Excel e fornecedores CNC',
   printPackTitle:'Imprimir pacote do fornecedor',printPackSub:'Lista de corte + etiquetas QR correspondentes',
   sendToPhoneTitle:'Enviar lista de corte para o telemóvel',sendToPhoneSub:'Painéis, quantidades e lista de verificação QR',
   panelsHeading:'Painéis',
   stickerSizeHeading:'Tamanho da etiqueta QR',stickerSizeSub:'Escolha um tamanho comum ou introduza as suas próprias medidas.',
   widthLabel:'Largura mm',heightLabel:'Altura mm',
   stickerPreviewHeading:'Pré-visualização da etiqueta',
   longEdge:'orla longa',longEdges:'orlas longas',shortEdge:'orla curta',shortEdges:'orlas curtas',
   noLongEdging:'Sem orla longa',noShortEdging:'Sem orla curta',
   cuttingTitle:'Lista de Corte para o Fornecedor',stickersTitle:'Etiquetas QR para o Fornecedor',
   qty:'Qtd.',material:'Material:',notSet:'Não definido',edging:'Orla:',notes:'Notas:',project:'Projeto',unit:'Unidade',
   csvHeaderPanelNo:'N.º do painel',csvHeaderPartName:'Nome da peça',csvHeaderThickness:'Espessura mm',csvHeaderLength:'Comprimento mm',csvHeaderWidth:'Largura mm',csvHeaderLongEdges:'Orlas longas',csvHeaderShortEdges:'Orlas curtas',csvHeaderMaterial:'Material',csvHeaderNotes:'Notas',deliverToCsv:'Entregar a',noCompletePanelsExport:'Nenhum painel completo pronto para exportar.',creatingCsv:'A criar CSV…',csvExported:'✓ CSV exportado',csvExportFailed:'Falha ao exportar o CSV.',printBlocked:'A janela de impressão foi bloqueada. Permite pop-ups para este ficheiro.',
   noCompletePanelsPrint:'Não há painéis completos prontos para imprimir.',buildingSupplierPack:'A criar o pacote do fornecedor…',deliverToLabel:'Entregar a:',seeMapLink:'Ver link do mapa',supplierPackReadyPrint:'✓ Pacote do fornecedor pronto para imprimir',supplierPackCouldNotCreate:'Não foi possível criar o pacote do fornecedor.',supplierPackPrintTitle:'Pacote do fornecedor'
  },
  nl:{
   pageTitle:'Leverancier',pageSubtitle:'Definitieve zaaginformatie en bijbehorende QR-stickers.',
   langLabel:'Taal',
   checkingPanels:'Panelen controleren…',readyToManufacture:'Klaar voor productie',
   panelNeedsChecking:'paneel moet worden gecontroleerd',panelsNeedChecking:'panelen moeten worden gecontroleerd',
   completePanels:'Volledige panelen',totalPieces:'Totaal aantal stuks',materials:'Materialen',
   piece:'stuk',pieces:'stuks',noCompleteMaterials:'Nog geen volledige materialen.',
   unnamedPart:'Naamloos onderdeel',quantity:'Aantal',noCompletePanels:'Geen volledige panelen klaar voor de leverancier.',
   deliveryHeading:'📍 Leverlocatie',openInMaps:'📍 Openen in Maps',
   pinnedNoAddress:'Vastgezette locatie op kaart (geen adres ingevoerd)',
   includeDelivery:'Leverlocatie opnemen',
   deliveryHintAddress:'Voeg "{address}" toe aan de zaaglijst, voor leveranciers die materiaal rechtstreeks leveren.',
   deliveryHintDefault:'Voeg de vastgezette locatie op de kaart toe aan de zaaglijst, voor leveranciers die materiaal rechtstreeks leveren.',
   downloadCsvTitle:'CSV downloaden',downloadCsvSub:'Excel en CNC-leveranciers',
   printPackTitle:'Leverancierspakket afdrukken',printPackSub:'Zaaglijst + bijbehorende QR-stickers',
   sendToPhoneTitle:'Zaaglijst naar telefoon sturen',sendToPhoneSub:'Panelen, aantallen en QR-scanchecklist',
   panelsHeading:'Panelen',
   stickerSizeHeading:'QR-stickerformaat',stickerSizeSub:'Kies een veelvoorkomend formaat of voer uw eigen afmetingen in.',
   widthLabel:'Breedte mm',heightLabel:'Hoogte mm',
   stickerPreviewHeading:'Stickervoorbeeld',
   longEdge:'lange kant',longEdges:'lange kanten',shortEdge:'korte kant',shortEdges:'korte kanten',
   noLongEdging:'Geen lange kant',noShortEdging:'Geen korte kant',
   cuttingTitle:'Zaaglijst voor Leverancier',stickersTitle:'QR-stickers voor Leverancier',
   qty:'Aant.',material:'Materiaal:',notSet:'Niet ingesteld',edging:'Kantenband:',notes:'Notities:',project:'Project',unit:'Eenheid',
   csvHeaderPanelNo:'Paneelnr.',csvHeaderPartName:'Onderdeelnaam',csvHeaderThickness:'Dikte mm',csvHeaderLength:'Lengte mm',csvHeaderWidth:'Breedte mm',csvHeaderLongEdges:'Lange kanten',csvHeaderShortEdges:'Korte kanten',csvHeaderMaterial:'Materiaal',csvHeaderNotes:'Notities',deliverToCsv:'Leveren aan',noCompletePanelsExport:'Geen complete panelen klaar om te exporteren.',creatingCsv:'CSV maken…',csvExported:'✓ CSV geëxporteerd',csvExportFailed:'CSV-export mislukt.',printBlocked:'Het afdrukvenster is geblokkeerd. Sta pop-ups toe voor dit bestand.',
   noCompletePanelsPrint:'Geen complete panelen zijn klaar om af te drukken.',buildingSupplierPack:'Leverancierspakket wordt gemaakt…',deliverToLabel:'Leveren aan:',seeMapLink:'Bekijk kaartlink',supplierPackReadyPrint:'✓ Leverancierspakket klaar om af te drukken',supplierPackCouldNotCreate:'Leverancierspakket kon niet worden aangemaakt.',supplierPackPrintTitle:'Leverancierspakket'
  },
  pl:{
   pageTitle:'Dostawca',pageSubtitle:'Ostateczne informacje o cięciu i pasujące etykiety QR.',
   langLabel:'Język',
   checkingPanels:'Sprawdzanie paneli…',readyToManufacture:'Gotowe do produkcji',
   panelNeedsChecking:'panel do sprawdzenia',panelsNeedChecking:'paneli do sprawdzenia',
   completePanels:'Kompletne panele',totalPieces:'Łączna liczba sztuk',materials:'Materiały',
   piece:'sztuka',pieces:'sztuk',noCompleteMaterials:'Brak jeszcze kompletnych materiałów.',
   unnamedPart:'Element bez nazwy',quantity:'Ilość',noCompletePanels:'Brak kompletnych paneli gotowych dla dostawcy.',
   deliveryHeading:'📍 Miejsce dostawy',openInMaps:'📍 Otwórz w Maps',
   pinnedNoAddress:'Przypięta lokalizacja na mapie (bez wpisanego adresu)',
   includeDelivery:'Uwzględnij miejsce dostawy',
   deliveryHintAddress:'Dodaj "{address}" do listy cięcia, dla dostawców dostarczających materiał bezpośrednio.',
   deliveryHintDefault:'Dodaj przypiętą lokalizację na mapie do listy cięcia, dla dostawców dostarczających materiał bezpośrednio.',
   downloadCsvTitle:'Pobierz CSV',downloadCsvSub:'Excel i dostawcy CNC',
   printPackTitle:'Drukuj pakiet dla dostawcy',printPackSub:'Lista cięcia + pasujące etykiety QR',
   sendToPhoneTitle:'Wyślij listę cięcia na telefon',sendToPhoneSub:'Panele, ilości i lista kontrolna QR',
   panelsHeading:'Panele',
   stickerSizeHeading:'Rozmiar etykiety QR',stickerSizeSub:'Wybierz typowy rozmiar lub wprowadź własne wymiary.',
   widthLabel:'Szerokość mm',heightLabel:'Wysokość mm',
   stickerPreviewHeading:'Podgląd etykiety',
   longEdge:'długa krawędź',longEdges:'długie krawędzie',shortEdge:'krótka krawędź',shortEdges:'krótkie krawędzie',
   noLongEdging:'Brak długiej krawędzi',noShortEdging:'Brak krótkiej krawędzi',
   cuttingTitle:'Lista Cięcia dla Dostawcy',stickersTitle:'Etykiety QR dla Dostawcy',
   qty:'Ilość',material:'Materiał:',notSet:'Nieustawiony',edging:'Obrzeże:',notes:'Notatki:',project:'Projekt',unit:'Jednostka',
   csvHeaderPanelNo:'Nr panelu',csvHeaderPartName:'Nazwa części',csvHeaderThickness:'Grubość mm',csvHeaderLength:'Długość mm',csvHeaderWidth:'Szerokość mm',csvHeaderLongEdges:'Długie krawędzie',csvHeaderShortEdges:'Krótkie krawędzie',csvHeaderMaterial:'Materiał',csvHeaderNotes:'Notatki',deliverToCsv:'Dostarczyć do',noCompletePanelsExport:'Brak kompletnych paneli gotowych do eksportu.',creatingCsv:'Tworzenie CSV…',csvExported:'✓ CSV wyeksportowany',csvExportFailed:'Eksport CSV nie powiódł się.',printBlocked:'Okno drukowania zostało zablokowane. Zezwól na wyskakujące okienka dla tego pliku.',
   noCompletePanelsPrint:'Żadne kompletne panele nie są gotowe do druku.',buildingSupplierPack:'Tworzenie pakietu dla dostawcy…',deliverToLabel:'Dostarczyć do:',seeMapLink:'Zobacz link do mapy',supplierPackReadyPrint:'✓ Pakiet dla dostawcy gotowy do druku',supplierPackCouldNotCreate:'Nie udało się utworzyć pakietu dla dostawcy.',supplierPackPrintTitle:'Pakiet dla dostawcy'
  }
 };
 const LANG_NAMES={en:'English',es:'Español',fr:'Français',de:'Deutsch',da:'Dansk',ro:'Română',it:'Italiano',pt:'Português',nl:'Nederlands',pl:'Polski'};
 const LANG_FLAGS={
  en:'<svg viewBox="0 0 60 36"><rect fill="#21468B" height="36" width="60"/><path d="M0 0L60 36M60 0L0 36" stroke="#fff" stroke-width="8"/><path d="M0 0L60 36M60 0L0 36" stroke="#C8102E" stroke-width="4"/><path d="M30 0v36M0 18h60" stroke="#fff" stroke-width="12"/><path d="M30 0v36M0 18h60" stroke="#C8102E" stroke-width="7"/></svg>',
  es:'<svg viewBox="0 0 60 36"><rect fill="#AA151B" height="36" width="60"/><rect fill="#F1BF00" height="18" width="60" y="9"/></svg>',
  da:'<svg viewBox="0 0 60 36"><rect fill="#C60C30" height="36" width="60"/><rect fill="#fff" height="36" width="5" x="18"/><rect fill="#fff" height="5" width="60" y="15"/></svg>',
  de:'<svg viewBox="0 0 60 36"><rect fill="#000" height="12" width="60"/><rect fill="#DD0000" height="12" width="60" y="12"/><rect fill="#FFCE00" height="12" width="60" y="24"/></svg>',
  fr:'<svg viewBox="0 0 60 36"><rect fill="#0055A4" height="36" width="20"/><rect fill="#fff" height="36" width="20" x="20"/><rect fill="#EF4135" height="36" width="20" x="40"/></svg>',
  ro:'<svg viewBox="0 0 60 36"><rect fill="#002B7F" height="36" width="20"/><rect fill="#FCD116" height="36" width="20" x="20"/><rect fill="#CE1126" height="36" width="20" x="40"/></svg>',
  it:'<svg viewBox="0 0 60 36"><rect fill="#009246" height="36" width="20"/><rect fill="#fff" height="36" width="20" x="20"/><rect fill="#CE2B37" height="36" width="20" x="40"/></svg>',
  pt:'<svg viewBox="0 0 60 36"><rect fill="#046A38" height="36" width="24"/><rect fill="#DA291C" height="36" width="36" x="24"/><circle cx="24" cy="18" fill="#FFCD00" r="6"/></svg>',
  nl:'<svg viewBox="0 0 60 36"><rect fill="#AE1C28" height="12" width="60"/><rect fill="#fff" height="12" width="60" y="12"/><rect fill="#21468B" height="12" width="60" y="24"/></svg>',
  pl:'<svg viewBox="0 0 60 36"><rect fill="#fff" height="18" width="60"/><rect fill="#DC143C" height="18" width="60" y="18"/></svg>'
 };
 function supplierLang(){return typeof currentAppLang==='function'?currentAppLang():'en'}
 function supplierT(){return SUPPLIER_I18N[supplierLang()]||SUPPLIER_I18N.en}
 window.SUPPLIER_I18N=SUPPLIER_I18N;window.supplierLang=supplierLang;window.supplierT=supplierT;
 function applySupplierStaticI18n(){
  const T=supplierT();
  const set=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};
  set('supplierPageTitle',T.pageTitle);
  set('supplierPageSubtitle',T.pageSubtitle);
  set('supplierMaterialsCardHeading',T.materials);
  set('supplierDeliveryHeading',T.deliveryHeading);
  const mapBtn=document.getElementById('supplierOpenDeliveryMap');if(mapBtn)mapBtn.textContent=T.openInMaps;
  set('supplierIncludeDeliveryLabel',T.includeDelivery);
  set('supplierPanelsHeading',T.panelsHeading);
  set('supplierStickerSizeHeading',T.stickerSizeHeading);
  set('supplierStickerSizeSub',T.stickerSizeSub);
  set('supplierWidthLabel',T.widthLabel);
  set('supplierHeightLabel',T.heightLabel);
  set('supplierPreviewHeading',T.stickerPreviewHeading);
  const csvBtn=document.getElementById('exportSupplierCsvBtn');if(csvBtn){const s=csvBtn.querySelector('strong'),m=csvBtn.querySelector('small');if(s)s.textContent=T.downloadCsvTitle;if(m)m.textContent=T.downloadCsvSub}
  const printBtn=document.getElementById('printSupplierPackBtn');if(printBtn){const s=printBtn.querySelector('strong'),m=printBtn.querySelector('small');if(s)s.textContent=T.printPackTitle;if(m)m.textContent=T.printPackSub}
  const sendBtn=document.getElementById('sendCuttingToPhoneBtn');if(sendBtn){const s=sendBtn.querySelector('strong'),m=sendBtn.querySelector('small');if(s)s.textContent=T.sendToPhoneTitle;if(m)m.textContent=T.sendToPhoneSub}
 }
 window.applySupplierStaticI18n=applySupplierStaticI18n;
 function deliveryInfo(pr){
  if(!pr)return null;
  const hasPin=pr.geoLat!=null&&pr.geoLng!=null;
  if(!hasPin&&!pr.address)return null;
  const mapUrl=hasPin?`https://www.google.com/maps/search/?api=1&query=${pr.geoLat},${pr.geoLng}`:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pr.address)}`;
  return {address:pr.address||'',mapUrl};
 }
 function syncDeliveryToggle(){
  const T=supplierT();
  const pr=project(),box=document.getElementById('supplierIncludeDelivery'),card=document.getElementById('supplierDeliveryToggleCard'),hint=document.getElementById('supplierDeliveryHint');
  const info=deliveryInfo(pr);
  const addrCard=document.getElementById('supplierDeliveryAddressCard'),addrText=document.getElementById('supplierDeliveryAddressText'),addrBtn=document.getElementById('supplierOpenDeliveryMap');
  if(addrCard)addrCard.style.display=info?'block':'none';
  if(info){
   if(addrText)addrText.textContent=info.address||T.pinnedNoAddress;
   if(addrBtn)addrBtn.onclick=()=>window.open(info.mapUrl,'_blank');
  }
  if(card)card.style.display=info?'flex':'none';
  if(!info)return;
  if(box)box.checked=!!pr.includeDeliveryAddress;
  if(hint)hint.textContent=info.address?T.deliveryHintAddress.replace('{address}',info.address):T.deliveryHintDefault;
 }
 document.getElementById('supplierIncludeDelivery')?.addEventListener('change',e=>{const pr=project();if(!pr)return;pr.includeDeliveryAddress=e.target.checked;save()});
 const statusEl=()=>document.getElementById('supplierActionStatus');
 function setStatus(text,kind='ok'){const el=statusEl();if(el){el.textContent=text;el.className='supplier-feedback '+kind}}
 function mat(p){const notSet=supplierT().notSet;return String(materialForPanel(p)||notSet).trim()||notSet}
 function rows(){return supplierParts()}
 function edge(n,kind){const T=supplierT();n=Number(n||0);const isLong=kind==='long';if(n===0)return isLong?T.noLongEdging:T.noShortEdging;const singular=isLong?T.longEdge:T.shortEdge,plural=isLong?T.longEdges:T.shortEdges;return n+' '+(n===1?singular:plural)}
 function renderSupplierPage(){const T=supplierT();const all=cabinetParts(),list=rows(),missing=all.length-list.length,b=document.getElementById('supplierReadyBadge');if(b){b.textContent=missing?`${missing} ${missing===1?T.panelNeedsChecking:T.panelsNeedChecking}`:T.readyToManufacture;b.className='supplier-ready '+(missing?'warn':'ready')}const mats={};list.forEach(p=>{const m=mat(p);mats[m]=(mats[m]||0)+Number(p.qty||1)});const s=document.getElementById('supplierSummary');if(s)s.innerHTML=`<div class="supplier-stat"><span>${T.completePanels}</span><strong>${list.length}</strong></div><div class="supplier-stat"><span>${T.totalPieces}</span><strong>${list.reduce((a,p)=>a+Number(p.qty||1),0)}</strong></div><div class="supplier-stat"><span>${T.materials}</span><strong>${Object.keys(mats).length}</strong></div>`;const ms=document.getElementById('supplierMaterialSummary');if(ms)ms.innerHTML=Object.keys(mats).length?`<div class="material-summary-grid">${Object.entries(mats).map(([m,q])=>`<div class="material-summary-item"><strong>${safe(m)}</strong><span>${q} ${q===1?T.piece:T.pieces}</span></div>`).join('')}</div>`:`<div class="muted">${T.noCompleteMaterials}</div>`;const cards=document.getElementById('supplierPanelCards');if(cards)cards.innerHTML=list.length?list.map(p=>`<article class="supplier-panel-card"><div class="supplier-panel-code">${safe(p.code)}</div><div><div class="supplier-panel-name">${safe(p.name||T.unnamedPart)}</div><div class="supplier-measure">${safe(p.thickness)} mm · ${safe(p.length)} × ${safe(p.width)} mm</div><div class="supplier-material-badge">${safe(mat(p))}</div><div class="supplier-edge-lines"><span class="supplier-edge-chip">${edge(p.edgeLong,'long')}</span><span class="supplier-edge-chip">${edge(p.edgeShort,'short')}</span></div></div><div class="supplier-qty"><span>${T.quantity}</span>${Number(p.qty||1)}</div></article>`).join(''):`<div class="empty">${T.noCompletePanels}</div>`;syncDeliveryToggle();applySupplierStaticI18n()}
 const baseRender=window.renderCutting;window.renderCutting=function(){if(typeof baseRender==='function')baseRender();renderSupplierPage()};
 function exportCsv(){const T=supplierT();const list=rows();if(!list.length){setStatus(T.noCompletePanelsExport,'err');return}const btn=document.getElementById('exportSupplierCsvBtn');btn.disabled=true;setStatus(T.creatingCsv);try{const pr=project(),info=pr?.includeDeliveryAddress?deliveryInfo(pr):null;const deliveryRows=info?[[T.deliverToCsv,info.address||'',info.mapUrl,'','','','','','',''],['','','','','','','','','','']]:[];const data=[[T.csvHeaderPanelNo,T.csvHeaderPartName,T.csvHeaderThickness,T.csvHeaderLength,T.csvHeaderWidth,T.csvHeaderLongEdges,T.csvHeaderShortEdges,T.quantity,T.csvHeaderMaterial,T.csvHeaderNotes],...deliveryRows,...list.map(p=>[p.code,p.name||'',p.thickness,p.length,p.width,Number(p.edgeLong||0),Number(p.edgeShort||0),Number(p.qty||1),mat(p),p.notes||''])];const csv='\ufeff'+data.map(r=>r.map(escCsv).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=((project()?.name||'Job')+'_'+(cabinet()?.name||'Unit')+'_cutting_list.csv').replace(/[^a-z0-9_-]+/gi,'_');document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus(T.csvExported)}catch(e){console.error(e);setStatus(T.csvExportFailed,'err')}finally{setTimeout(()=>btn.disabled=false,400)}}
 function openPrint(title,html){const w=window.open('','_blank');if(!w){setStatus(supplierT().printBlocked,'err');return false}w.document.open();w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safe(title)}</title><style>@page{margin:12mm}body{font-family:Arial,sans-serif;color:#272249}h1{font-family:Georgia,serif}.card{border:2px solid #d8d6e1;border-left:8px solid #ffc400;border-radius:14px;padding:14px;margin-bottom:10px;page-break-inside:avoid}.row{display:flex;justify-content:space-between;gap:12px}.code{font-size:22px;font-weight:900}.name{font-size:18px;font-weight:900}.measure{font-size:18px;font-weight:800;margin-top:6px}.small{font-size:13px;color:#625c6d;margin-top:5px}.stickers{display:grid;grid-template-columns:repeat(2,1fr);gap:8mm}.sticker{border:2px solid #29231f;border-radius:10px;padding:10px;display:grid;grid-template-columns:1fr 90px;gap:10px;page-break-inside:avoid}.sticker img{width:90px;height:90px}.qty{font-weight:900}</style>
<style id="siteRoomDetailsStyles">
.site-room-modal{position:fixed;inset:0;background:rgba(24,20,45,.72);z-index:10050;display:none;align-items:center;justify-content:center;padding:18px}.site-room-modal.open{display:flex}.site-room-dialog{width:min(1180px,96vw);max-height:92vh;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 28px 80px rgba(20,17,42,.35);display:flex;flex-direction:column}.site-room-head{display:flex;align-items:center;gap:14px;padding:18px 22px;border-bottom:2px solid #eceaf2}.site-room-head .room-badge{font-size:42px}.site-room-head h2{margin:0;font-size:30px}.site-room-head p{margin:4px 0 0;color:#6d687d;font-weight:700}.site-room-close{margin-left:auto;width:50px;height:50px;border-radius:15px;border:2px solid #ddd9e8;background:#fff;font-size:30px;cursor:pointer}.site-room-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,.9fr);min-height:560px;overflow:auto}.site-reference-pane{padding:18px;border-right:2px solid #eceaf2;background:#f8f9fc}.site-reference-frame{background:#e9ebf1;border-radius:20px;min-height:420px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}.site-reference-frame img{max-width:100%;max-height:62vh;object-fit:contain}.site-reference-empty{font-size:24px;color:#777286;text-align:center;padding:30px}.site-thumb-row{display:flex;gap:10px;overflow:auto;padding-top:12px}.site-thumb{width:86px;height:68px;border:3px solid transparent;border-radius:12px;object-fit:cover;cursor:pointer;background:#eee}.site-thumb.active{border-color:#f1b900}.site-design-pane{padding:22px;display:flex;flex-direction:column;gap:15px}.site-facts{display:grid;grid-template-columns:1fr 1fr;gap:12px}.site-fact{border:2px solid #e4e1eb;border-radius:18px;padding:14px;background:#fff}.site-fact b{display:block;font-size:25px;color:#2d2854}.site-fact span{color:#6c677d;font-weight:750}.site-notes-box{border:2px solid #e4e1eb;border-radius:18px;padding:15px;min-height:90px}.site-notes-box h3{margin:0 0 8px;font-size:19px}.site-detail-actions{display:grid;gap:12px;margin-top:auto}.site-detail-actions .btn{min-height:60px;font-size:19px;border-radius:16px}.site-detail-actions .primary{background:#ffc400;color:#29234f;border-color:#dda900}.site-drawing-placeholder{border:3px dashed #cfcbd9;border-radius:22px;min-height:190px;display:flex;align-items:center;justify-content:center;text-align:center;color:#716c80;font-weight:800;font-size:20px;padding:25px}.site-job-tag{display:inline-flex;align-items:center;gap:8px;background:#eaf8ef;color:#12783c;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900;margin-top:7px}.folder-card.site-received{border-color:#31a65d;background:#f4fbf6}.folder-card .site-details-btn{border-color:#456fc4;background:#f3f6ff}
@media(max-width:760px){.site-room-modal{padding:7px}.site-room-dialog{width:100%;max-height:96vh;border-radius:20px}.site-room-body{grid-template-columns:1fr}.site-reference-pane{border-right:0;border-bottom:2px solid #eceaf2}.site-reference-frame{min-height:260px}.site-facts{grid-template-columns:1fr 1fr}.site-room-head h2{font-size:23px}}
</style>



<style id="v123-illustrated-homepage">
.v12-home{background:linear-gradient(180deg,#fff 0%,#fbfbfe 100%);padding:24px!important}
.v12-home-header{margin-bottom:18px}
.v12-home-header h2{font-size:34px;color:#171c46;letter-spacing:-.4px}
.v12-home-header p{font-size:17px;color:#666b84}
.v12-main-actions{gap:20px;margin-bottom:22px}
.v12-action-card.illustrated-card{min-height:210px;padding:0 24px 0 0;grid-template-columns:300px 1fr auto;gap:22px;overflow:hidden;border-width:2px;box-shadow:0 10px 28px rgba(39,42,84,.08)}
.v12-action-card.illustrated-card .v123-card-art{width:300px;height:210px;object-fit:cover;object-position:center;display:block;align-self:stretch;border-radius:20px 0 0 20px}
.v12-action-card.illustrated-card .v123-card-copy{align-self:center}
.v12-action-card.illustrated-card strong{font-size:29px;line-height:1.08;letter-spacing:-.3px}
.v12-action-card.illustrated-card small{font-size:18px;line-height:1.45;margin-top:12px;max-width:330px}
.v12-action-card.illustrated-card>b{font-size:48px}
.v12-green{background:#f5fff7;border-color:#9bddae}.v12-green strong,.v12-green>b{color:#089538}
.v12-blue{background:#f4f8ff;border-color:#9dbdff}.v12-blue strong,.v12-blue>b{color:#145ad4}
.v12-orange{background:#fff9f1;border-color:#ffc57a}.v12-orange strong,.v12-orange>b{color:#f06a00}
.v12-purple{background:#faf6ff;border-color:#c9a9ff}.v12-purple strong,.v12-purple>b{color:#6a2bd4}
.v12-site-jobs,.v12-recent-section{border-radius:24px;box-shadow:0 8px 24px rgba(39,42,84,.07)}
.site-jobs-cloud{font-size:34px;width:58px;height:58px;display:grid;place-items:center;border-radius:16px;background:linear-gradient(145deg,#3d7cff,#76a6ff);color:#fff;box-shadow:0 8px 18px rgba(61,124,255,.25)}
.v12-section-heading h3{font-size:25px;color:#171c46}
.v12-section-heading p{font-size:15px}
@media(max-width:1200px){.v12-action-card.illustrated-card{grid-template-columns:220px 1fr auto;min-height:175px}.v12-action-card.illustrated-card .v123-card-art{width:220px;height:175px}.v12-action-card.illustrated-card strong{font-size:24px}.v12-action-card.illustrated-card small{font-size:15px}}
@media(max-width:820px){.v12-action-card.illustrated-card{grid-template-columns:145px 1fr auto;min-height:140px}.v12-action-card.illustrated-card .v123-card-art{width:145px;height:140px}.v12-action-card.illustrated-card strong{font-size:21px}.v12-action-card.illustrated-card small{font-size:14px;margin-top:7px}}
@media(max-width:520px){.v12-home{padding:12px!important}.v12-action-card.illustrated-card{grid-template-columns:105px 1fr auto;min-height:118px;padding-right:13px;gap:12px}.v12-action-card.illustrated-card .v123-card-art{width:105px;height:118px}.v12-action-card.illustrated-card strong{font-size:18px}.v12-action-card.illustrated-card small{font-size:12px}.v12-action-card.illustrated-card>b{font-size:34px}}
</style>
</head><body>${html}</body></html>`);w.document.close();setTimeout(()=>{w.focus();w.print()},350);return true}
 function qrData(text){const box=document.createElement('div');box.style.position='fixed';box.style.left='-9999px';document.body.appendChild(box);makeQr(box,text,180);const c=box.querySelector('canvas'),i=box.querySelector('img');let d='';try{d=c?c.toDataURL('image/png'):(i?.src||'')}catch(e){}box.remove();return d}
 window.qrData=qrData;
 function printSupplierPack(){const T=supplierT();const list=rows();if(!list.length){setStatus(T.noCompletePanelsPrint,'err');return}const btn=document.getElementById('printSupplierPackBtn');if(btn)btn.disabled=true;setStatus(T.buildingSupplierPack);try{const pr=project(),ref=window.assembleOneJobRef?assembleOneJobRef(pr):'';const info=pr?.includeDeliveryAddress?deliveryInfo(pr):null;const deliveryLine=info?`<p><strong>${T.deliverToLabel}</strong> ${safe(info.address||T.seeMapLink)} · <a href="${info.mapUrl}">${info.mapUrl}</a></p>`:'';const cutting=`<section><h1>${T.cuttingTitle}</h1><p>${safe(pr?.name||T.project)} · ${safe(cabinet()?.name||T.unit)}</p>${deliveryLine}${list.map(p=>`<div class="card"><div class="row"><div><div class="code">${safe(p.code)}</div><div class="name">${safe(p.name||'')}</div></div><div class="qty">${T.qty} ${Number(p.qty||1)}</div></div><div class="measure">${safe(p.thickness)} mm · ${safe(p.length)} × ${safe(p.width)} mm</div><div class="small">${T.material} ${safe(mat(p))}</div><div class="small">${T.edging} ${edge(p.edgeLong,'long')} · ${edge(p.edgeShort,'short')}</div>${p.notes?`<div class="small">${T.notes} ${safe(p.notes)}</div>`:''}</div>`).join('')}</section>`;const stickers=`<section style="break-before:page;page-break-before:always"><h1>${T.stickersTitle}</h1><p>${safe(pr?.name||T.project)} · ${safe(cabinet()?.name||T.unit)}</p><div class="stickers">${list.map(p=>{const q=qrData(phoneQrText(p));return `<div class="sticker"><div><div class="row"><div class="code">${safe(p.code)}</div><div class="qty">${T.qty} ${Number(p.qty||1)}</div></div><div class="name">${safe(p.name||'')}</div><div class="measure">${safe(p.thickness)} mm · ${safe(p.length)} × ${safe(p.width)} mm</div><div class="small">${T.material} ${safe(mat(p))}</div><div class="small">${safe(ref)} · ${safe(pr?.name||'')}</div></div>${q?`<img src="${q}">`:''}</div>`}).join('')}</div></section>`;if(openPrint(T.supplierPackPrintTitle,cutting+stickers))setStatus(T.supplierPackReadyPrint)}catch(e){console.error(e);setStatus(T.supplierPackCouldNotCreate,'err')}finally{if(btn)setTimeout(()=>btn.disabled=false,400)}}
 document.getElementById('exportSupplierCsvBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();exportCsv()},true);document.getElementById('printSupplierPackBtn')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();printSupplierPack()},true);renderSupplierPage();
})();


// --- block 14 ---

(function(){
  const DB_NAME='assembleone_stable_v1',DB_STORE='drawings',STATE_STORE='project_state';
  let dbPromise=null,saveTimer=null,noticeTimer=null;
  function db(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,2);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(DB_STORE))r.result.createObjectStore(DB_STORE);if(!r.result.objectStoreNames.contains(STATE_STORE))r.result.createObjectStore(STATE_STORE)};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
    return dbPromise;
  }
  function keyFor(pr,c){return String(pr.id)+':'+String(c.id)}
  async function putDrawing(pr,c){if(!c||!c.drawing)return;try{const d=await db();const tx=d.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put({drawing:c.drawing,drawingType:c.drawingType||'image',drawingName:c.drawingName||''},keyFor(pr,c))}catch(e){console.warn('Drawing backup failed',e)}}
  async function getDrawing(pr,c){try{const d=await db();return await new Promise((res,rej)=>{const r=d.transaction(DB_STORE,'readonly').objectStore(DB_STORE).get(keyFor(pr,c));r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)})}catch(e){return null}}
  async function putProjectState(){try{const d=await db();const snapshot=JSON.parse(JSON.stringify(state));await new Promise((res,rej)=>{const tx=d.transaction(STATE_STORE,'readwrite');tx.objectStore(STATE_STORE).put({savedAt:Date.now(),state:snapshot},'active');tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}catch(e){console.warn('Project backup failed',e)}}
  async function getProjectState(){try{const d=await db();return await new Promise((res,rej)=>{const r=d.transaction(STATE_STORE,'readonly').objectStore(STATE_STORE).get('active');r.onsuccess=()=>res(r.result||null);r.onerror=()=>rej(r.error)})}catch(e){return null}}
  function cloneLight(){
    const copy=JSON.parse(JSON.stringify(state));
    (copy.projects||[]).forEach(pr=>(pr.cabinets||[]).forEach(c=>{if(c.drawing){c.hasStoredDrawing=true;c.drawing=null}}));
    return copy;
  }
  function commitVisible(){
    try{
      const p=typeof project==='function'?project():null,partNow=typeof part==='function'?part():null,c=typeof cabinet==='function'?cabinet():null;
      const n=document.getElementById('projectName'),cust=document.getElementById('customerName');
      if(p){if(n&&n.value.trim())p.name=n.value.trim();if(cust)p.customer=cust.value.trim()}
      if(partNow){
        const map={fThickness:'thickness',fLength:'length',fWidth:'width',fQty:'qty',fMaterial:'material',fNotes:'notes'};
        Object.entries(map).forEach(([id,k])=>{const el=document.getElementById(id);if(!el)return;let v=el.value;if(['thickness','length','width','qty'].includes(k))v=v===''?'':Number(v);if(['thickness','length','width'].includes(k)&&v!=='')v=(typeof unitToMM==='function'&&typeof currentMeasureUnit==='function')?unitToMM(v,currentMeasureUnit()):v;if(v!==''||k==='notes'||k==='material')partNow[k]=v});
      }
      const stage=document.getElementById('drawingStage');if(c&&stage){c.viewState=c.viewState||{};c.viewState.scrollLeft=stage.scrollLeft;c.viewState.scrollTop=stage.scrollTop;c.viewState.zoom=Number(state.drawingZoom||1)}
    }catch(e){console.warn('Live form commit failed',e)}
  }
  function showSaved(){const bar=document.getElementById('a131RecoveryBar');if(!bar)return;bar.style.display='block';clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>bar.style.display='none',850)}
  async function stableSave(showNotice){
    commitVisible();
    try{
      const light=cloneLight();
      localStorage.setItem(STORE,JSON.stringify(light));
      sessionStorage.setItem(STORE+'_draft',JSON.stringify(light));
      for(const pr of state.projects||[])for(const c of pr.cabinets||[])if(c.drawing)putDrawing(pr,c);
      await putProjectState();
      if(showNotice)showSaved();
      return true;
    }catch(e){console.error('Stable save failed',e);return false}
  }
  window.a131StableSave=stableSave;
  try{save=stableSave}catch(e){}
  function queueSave(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>stableSave(false),180)}
  document.addEventListener('input',e=>{if(e.target&&e.target.matches('input,textarea,select'))queueSave()},true);
  document.addEventListener('change',e=>{if(e.target&&e.target.matches('input,textarea,select'))stableSave(false)},true);
  document.addEventListener('click',e=>{if(e.target.closest('.nav-btn,[data-step-screen],#saveNextBtn,#checkAllPanelsBtn,#newCabinetBtn,[data-open-job],[data-open-cabinet]'))stableSave(false)},true);
  window.addEventListener('pagehide',()=>stableSave(false));
  window.addEventListener('beforeunload',()=>{commitVisible();try{localStorage.setItem(STORE,JSON.stringify(cloneLight()))}catch(e){}});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')stableSave(false)});
  setInterval(()=>stableSave(false),4000);
  async function restoreProjectState(){
    const currentHasJobs=Array.isArray(state.projects)&&state.projects.length>0;
    if(currentHasJobs)return false;
    const rec=await getProjectState();
    if(!rec?.state||!Array.isArray(rec.state.projects)||!rec.state.projects.length)return false;
    state=rec.state;
    try{localStorage.setItem(STORE,JSON.stringify(cloneLight()))}catch(e){}
    renderAll();show(state.screen||'jobs');showSaved();
    return true;
  }
  async function hydrateDrawings(){
    let changed=false;
    for(const pr of state.projects||[])for(const c of pr.cabinets||[])if(!c.drawing&&c.hasStoredDrawing){const rec=await getDrawing(pr,c);if(rec){c.drawing=rec.drawing;c.drawingType=rec.drawingType;c.drawingName=rec.drawingName;changed=true}}
    if(changed){renderAll();show(state.screen||'jobs')}
  }
  (async()=>{await restoreProjectState();await hydrateDrawings()})();
  const back=document.getElementById('a131BackStudio');if(back)back.onclick=()=>{document.body.classList.remove('guide-only');location.hash='';show('qr')};
  const overlay=document.getElementById('a131PrintOverlay'),frame=document.getElementById('a131PrintFrame');
  window.a131OpenPrintPreview=function(title,bodyHtml){
    stableSave(false);document.querySelector('#a131PrintHead strong').textContent=title||'Print preview';
    const doc=`<!doctype html><html><head><meta charset="utf-8"><title>`+String(title||'Print')+`</title><style>@page{margin:12mm}body{font-family:Arial,sans-serif;color:#272249;margin:18px}h1{font-family:Georgia,serif}.card{border:2px solid #d8d6e1;border-left:8px solid #ffc400;border-radius:14px;padding:14px;margin-bottom:10px;break-inside:avoid}.row{display:flex;justify-content:space-between;gap:12px}.code{font-size:22px;font-weight:900}.name{font-size:18px;font-weight:900}.measure{font-size:18px;font-weight:800;margin-top:6px}.small{font-size:13px;color:#625c6d;margin-top:5px}.stickers{display:grid;grid-template-columns:repeat(2,1fr);gap:8mm}.sticker{border:2px solid #29231f;border-radius:10px;padding:10px;display:grid;grid-template-columns:1fr 90px;gap:10px;break-inside:avoid}.sticker img{width:90px;height:90px}</style>
<style id="a138-panel-check-contrast">
/* Version 10.42 — high contrast panel review states. */
.panel-check-card.incomplete{background:#ffffff!important;border:3px solid #dc2626!important;border-left:12px solid #dc2626!important;color:#17213f!important;box-shadow:0 5px 18px rgba(220,38,38,.10)!important}
.panel-check-card.incomplete .panel-check-code,.panel-check-card.incomplete .panel-check-name,.panel-check-card.incomplete .panel-check-meta{color:#17213f!important}
.panel-review-warning{background:#ffffff!important;border:4px solid #dc2626!important;color:#991b1b!important;animation:none!important;box-shadow:0 4px 14px rgba(220,38,38,.12)!important}
.panel-review-warning .review-icon{color:#dc2626!important;font-size:58px!important}
.panel-review-warning .review-title{color:#991b1b!important;font-size:23px!important}
.panel-review-warning .review-help{color:#3f3f46!important;font-size:15px!important}
.panel-missing-chip{background:#fff1f2!important;border:2px solid #ef4444!important;color:#991b1b!important}
.panel-check-card.complete{background:#ecfdf3!important;border:3px solid #22a447!important;border-left:12px solid #22a447!important;color:#123b21!important}
.panel-review-ok{background:#dcfce7!important;border:4px solid #22a447!important;color:#126b32!important}
.panel-review-ok .review-icon{color:#16a34a!important;font-size:58px!important}
.panel-check-actions .btn{background:#ffffff!important;color:#20204f!important;border:2px solid #cfd1df!important}
@media(max-width:850px){.panel-check-card.incomplete,.panel-check-card.complete{border-left-width:8px!important}}
</style>

<style id="siteRoomDetailsStyles">
.site-room-modal{position:fixed;inset:0;background:rgba(24,20,45,.72);z-index:10050;display:none;align-items:center;justify-content:center;padding:18px}.site-room-modal.open{display:flex}.site-room-dialog{width:min(1180px,96vw);max-height:92vh;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 28px 80px rgba(20,17,42,.35);display:flex;flex-direction:column}.site-room-head{display:flex;align-items:center;gap:14px;padding:18px 22px;border-bottom:2px solid #eceaf2}.site-room-head .room-badge{font-size:42px}.site-room-head h2{margin:0;font-size:30px}.site-room-head p{margin:4px 0 0;color:#6d687d;font-weight:700}.site-room-close{margin-left:auto;width:50px;height:50px;border-radius:15px;border:2px solid #ddd9e8;background:#fff;font-size:30px;cursor:pointer}.site-room-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,.9fr);min-height:560px;overflow:auto}.site-reference-pane{padding:18px;border-right:2px solid #eceaf2;background:#f8f9fc}.site-reference-frame{background:#e9ebf1;border-radius:20px;min-height:420px;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}.site-reference-frame img{max-width:100%;max-height:62vh;object-fit:contain}.site-reference-empty{font-size:24px;color:#777286;text-align:center;padding:30px}.site-thumb-row{display:flex;gap:10px;overflow:auto;padding-top:12px}.site-thumb{width:86px;height:68px;border:3px solid transparent;border-radius:12px;object-fit:cover;cursor:pointer;background:#eee}.site-thumb.active{border-color:#f1b900}.site-design-pane{padding:22px;display:flex;flex-direction:column;gap:15px}.site-facts{display:grid;grid-template-columns:1fr 1fr;gap:12px}.site-fact{border:2px solid #e4e1eb;border-radius:18px;padding:14px;background:#fff}.site-fact b{display:block;font-size:25px;color:#2d2854}.site-fact span{color:#6c677d;font-weight:750}.site-notes-box{border:2px solid #e4e1eb;border-radius:18px;padding:15px;min-height:90px}.site-notes-box h3{margin:0 0 8px;font-size:19px}.site-detail-actions{display:grid;gap:12px;margin-top:auto}.site-detail-actions .btn{min-height:60px;font-size:19px;border-radius:16px}.site-detail-actions .primary{background:#ffc400;color:#29234f;border-color:#dda900}.site-drawing-placeholder{border:3px dashed #cfcbd9;border-radius:22px;min-height:190px;display:flex;align-items:center;justify-content:center;text-align:center;color:#716c80;font-weight:800;font-size:20px;padding:25px}.site-job-tag{display:inline-flex;align-items:center;gap:8px;background:#eaf8ef;color:#12783c;border-radius:999px;padding:6px 10px;font-size:12px;font-weight:900;margin-top:7px}.folder-card.site-received{border-color:#31a65d;background:#f4fbf6}.folder-card .site-details-btn{border-color:#456fc4;background:#f3f6ff}
@media(max-width:760px){.site-room-modal{padding:7px}.site-room-dialog{width:100%;max-height:96vh;border-radius:20px}.site-room-body{grid-template-columns:1fr}.site-reference-pane{border-right:0;border-bottom:2px solid #eceaf2}.site-reference-frame{min-height:260px}.site-facts{grid-template-columns:1fr 1fr}.site-room-head h2{font-size:23px}}
</style>



<style id="v123-illustrated-homepage">
.v12-home{background:linear-gradient(180deg,#fff 0%,#fbfbfe 100%);padding:24px!important}
.v12-home-header{margin-bottom:18px}
.v12-home-header h2{font-size:34px;color:#171c46;letter-spacing:-.4px}
.v12-home-header p{font-size:17px;color:#666b84}
.v12-main-actions{gap:20px;margin-bottom:22px}
.v12-action-card.illustrated-card{min-height:210px;padding:0 24px 0 0;grid-template-columns:300px 1fr auto;gap:22px;overflow:hidden;border-width:2px;box-shadow:0 10px 28px rgba(39,42,84,.08)}
.v12-action-card.illustrated-card .v123-card-art{width:300px;height:210px;object-fit:cover;object-position:center;display:block;align-self:stretch;border-radius:20px 0 0 20px}
.v12-action-card.illustrated-card .v123-card-copy{align-self:center}
.v12-action-card.illustrated-card strong{font-size:29px;line-height:1.08;letter-spacing:-.3px}
.v12-action-card.illustrated-card small{font-size:18px;line-height:1.45;margin-top:12px;max-width:330px}
.v12-action-card.illustrated-card>b{font-size:48px}
.v12-green{background:#f5fff7;border-color:#9bddae}.v12-green strong,.v12-green>b{color:#089538}
.v12-blue{background:#f4f8ff;border-color:#9dbdff}.v12-blue strong,.v12-blue>b{color:#145ad4}
.v12-orange{background:#fff9f1;border-color:#ffc57a}.v12-orange strong,.v12-orange>b{color:#f06a00}
.v12-purple{background:#faf6ff;border-color:#c9a9ff}.v12-purple strong,.v12-purple>b{color:#6a2bd4}
.v12-site-jobs,.v12-recent-section{border-radius:24px;box-shadow:0 8px 24px rgba(39,42,84,.07)}
.site-jobs-cloud{font-size:34px;width:58px;height:58px;display:grid;place-items:center;border-radius:16px;background:linear-gradient(145deg,#3d7cff,#76a6ff);color:#fff;box-shadow:0 8px 18px rgba(61,124,255,.25)}
.v12-section-heading h3{font-size:25px;color:#171c46}
.v12-section-heading p{font-size:15px}
@media(max-width:1200px){.v12-action-card.illustrated-card{grid-template-columns:220px 1fr auto;min-height:175px}.v12-action-card.illustrated-card .v123-card-art{width:220px;height:175px}.v12-action-card.illustrated-card strong{font-size:24px}.v12-action-card.illustrated-card small{font-size:15px}}
@media(max-width:820px){.v12-action-card.illustrated-card{grid-template-columns:145px 1fr auto;min-height:140px}.v12-action-card.illustrated-card .v123-card-art{width:145px;height:140px}.v12-action-card.illustrated-card strong{font-size:21px}.v12-action-card.illustrated-card small{font-size:14px;margin-top:7px}}
@media(max-width:520px){.v12-home{padding:12px!important}.v12-action-card.illustrated-card{grid-template-columns:105px 1fr auto;min-height:118px;padding-right:13px;gap:12px}.v12-action-card.illustrated-card .v123-card-art{width:105px;height:118px}.v12-action-card.illustrated-card strong{font-size:18px}.v12-action-card.illustrated-card small{font-size:12px}.v12-action-card.illustrated-card>b{font-size:34px}}
</style>
</head><body>`+bodyHtml+'</body></html>';
    frame.srcdoc=doc;overlay.style.display='block';overlay.setAttribute('aria-hidden','false');
  };
  document.getElementById('a131ClosePrint').onclick=()=>{overlay.style.display='none';overlay.setAttribute('aria-hidden','true');frame.srcdoc=''};
  document.getElementById('a131PrintNow').onclick=()=>{try{frame.contentWindow.focus();frame.contentWindow.print()}catch(e){alert(st('msg.printPreviewCouldNotOpen'))}};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.style.display==='block')document.getElementById('a131ClosePrint').click()});
  // Replace popup based supplier printing with the in app preview.
  document.addEventListener('click',function(e){
    const btn=e.target.closest('#printSupplierPackBtn');if(!btn)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    stableSave(false);
    const list=(typeof supplierParts==='function'?supplierParts():[]).filter(Boolean);if(!list.length){alert(st('msg.noCompletePanelsToPrint'));return}
    const T=typeof window.supplierT==='function'?window.supplierT():{};
    const pr=project(),unit=cabinet(),mat=p=>{const m=typeof materialForPanel==='function'?materialForPanel(p):p.material;return m||T.notSet};
    const esc=x=>safe(x==null?'':x),edge=(v,singularKey,pluralKey)=>Number(v||0)+' '+(Number(v||0)===1?T[singularKey]:T[pluralKey]);
    const cutting='<section><h1>'+T.cuttingTitle+'</h1><p>'+esc(pr?.name||T.project)+' · '+esc(unit?.name||T.unit)+'</p>'+list.map(p=>'<div class="card"><div class="row"><div><div class="code">'+esc(p.code)+'</div><div class="name">'+esc(p.name||'')+'</div></div><strong>'+T.qty+' '+Number(p.qty||1)+'</strong></div><div class="measure">'+esc(p.thickness)+' mm · '+esc(p.length)+' × '+esc(p.width)+' mm</div><div class="small">'+T.material+' '+esc(mat(p))+'</div><div class="small">'+T.edging+' '+edge(p.edgeLong,'longEdge','longEdges')+' · '+edge(p.edgeShort,'shortEdge','shortEdges')+'</div>'+(p.notes?'<div class="small">'+T.notes+' '+esc(p.notes)+'</div>':'')+'</div>').join('')+'</section>';
    const stickers='<section style="page-break-before:always"><h1>'+T.stickersTitle+'</h1><div class="stickers">'+list.map(p=>{let q='';try{q=typeof qrData==='function'?qrData(phoneQrText(p)):''}catch(err){}return '<div class="sticker"><div><div class="row"><div class="code">'+esc(p.code)+'</div><strong>'+T.qty+' '+Number(p.qty||1)+'</strong></div><div class="name">'+esc(p.name||'')+'</div><div class="measure">'+esc(p.thickness)+' mm · '+esc(p.length)+' × '+esc(p.width)+' mm</div><div class="small">'+T.material+' '+esc(mat(p))+'</div></div>'+(q?'<img src="'+q+'">':'')+'</div>'}).join('')+'</div></section>';
    window.a131OpenPrintPreview('Supplier Pack',cutting+stickers);
  },true);
  // QR label print also stays inside Studio.
  document.addEventListener('click',function(e){const btn=e.target.closest('#printQrBtn');if(!btn)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();stableSave(false);if(typeof renderQr==='function')renderQr();setTimeout(()=>{const grid=document.getElementById('qrGrid');if(!grid||!grid.children.length){alert(st('msg.generateQrCodesFirst'));return}window.a131OpenPrintPreview('QR Labels','<div class="stickers">'+grid.innerHTML+'</div>')},80)},true);
})();


// --- block 15 ---

(function(){
  function field(id){return document.getElementById(id)}
  document.addEventListener('click',function(e){
    const button=e.target.closest&&e.target.closest('#saveNextBtn');
    if(!button)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const p=typeof part==='function'?part():null;
    const c=typeof cabinet==='function'?cabinet():null;
    const pr=typeof project==='function'?project():null;
    if(!p)return;

    const thickness=field('fThickness')?.value ?? p.thickness ?? 19;
    const length=field('fLength')?.value ?? '';
    const width=field('fWidth')?.value ?? '';
    const qty=field('fQty')?.value ?? '';
    const notes=field('fNotes')?.value ?? p.notes ?? '';

    p.thickness=thickness===''?'':Number(thickness);
    p.length=length===''?'':Number(length);
    p.width=width===''?'':Number(width);
    p.qty=qty===''?'':Number(qty);
    p.notes=notes;

    const materialInput=field('materialCustomInput');
    if(materialInput&&materialInput.value.trim()&&typeof window.commitAssembleOneMaterial==='function'){
      window.commitAssembleOneMaterial(materialInput.value.trim());
    }
    const activeMaterial=String(p.material||pr?.defaultMaterial||c?.lastMaterial||'').trim();
    if(activeMaterial){
      p.material=activeMaterial;
      if(c)c.lastMaterial=activeMaterial;
      if(pr)pr.defaultMaterial=activeMaterial;
      if(typeof storeMaterialName==='function')storeMaterialName(activeMaterial);
    }
    if(c){
      c.lastThickness=Number(thickness)||(typeof getDefaultThicknessMM==='function'?getDefaultThicknessMM():19);
      if(typeof setDefaultThicknessMM==='function')setDefaultThicknessMM(c.lastThickness);
      // Most panels in a wardrobe repeat the same length/width (four
      // shelves, matching sides, etc.) -- remember the last-saved size so
      // the next new panel starts pre-filled with it instead of blank, the
      // same way thickness already carries over. Still just a starting
      // point: the length/width fields stay editable for a different size.
      if(p.length!==''&&p.length!=null)c.lastLength=Number(p.length)||c.lastLength;
      if(p.width!==''&&p.width!=null)c.lastWidth=Number(p.width)||c.lastWidth;
      const stage=field('drawingStage');
      c.viewState=c.viewState||{};
      c.viewState.zoom=Number(state.drawingZoom||1);
      c.viewState.scrollLeft=stage?.scrollLeft||0;
      c.viewState.scrollTop=stage?.scrollTop||0;
    }

    if(typeof closeMaterialPicker==='function')closeMaterialPicker();
    if(typeof closeNotesPicker==='function')closeNotesPicker();
    state.currentPart=null;
    const stored=typeof save==='function'?save():true;
    if(typeof showPanelSavedToast==='function')showPanelSavedToast(stored!==false);
    if(typeof renderAll==='function')renderAll();
    if(typeof show==='function')show('mark');

    requestAnimationFrame(function(){
      const t=field('fThickness'),l=field('fLength'),w=field('fWidth'),q=field('fQty');
      if(t)t.value=String(Number(thickness)||(typeof getDefaultThicknessMM==='function'?getDefaultThicknessMM():19));
      if(l){l.value='';l.placeholder='';}
      if(w){w.value='';w.placeholder='';}
      if(q){q.value='';q.placeholder='';}
      if(typeof updateEdgePreview==='function')updateEdgePreview();
      if(l){l.focus();try{l.select()}catch(_){} }
    });
  },true);
})();


// --- block 16 ---

(function(){
  const previousShow = window.show;
  if(typeof previousShow === 'function'){
    window.show = function(name){
      const result = previousShow.apply(this, arguments);
      if(name === 'bom' && typeof window.renderJobBom === 'function'){
        window.renderJobBom();
      }
      return result;
    };
    try{ show = window.show; }catch(e){}
  }
  document.addEventListener('dblclick', function(e){
    if(!e.target.closest('[data-review-panel]')) return;
    setTimeout(function(){
      if(typeof window.renderJobBom === 'function') window.renderJobBom();
    }, 20);
  }, true);
  const finishScreen = document.getElementById('screen-bom');
  if(finishScreen && window.MutationObserver){
    new MutationObserver(function(){
      if(finishScreen.classList.contains('active') && typeof window.renderJobBom === 'function'){
        window.renderJobBom();
      }
    }).observe(finishScreen,{attributes:true,attributeFilter:['class']});
  }
})();


// --- block 17 ---

/* AssembleOne 10.88 reliable single-channel sync fix */
(function(){
  const CHANNEL="mads_assembleone_1088";
  const ROOT=`sync_v2/${CHANNEL}`;
  window.ASSEMBLEONE_SYNC_CHANNEL=CHANNEL;

  // Studio-to-phone sending (sendPackToPhoneDirectly/exportProjectToMobile) used to
  // live here, but it was superseded by the "10.89 separate reliable Supplier and
  // Site Job sending" block below (publish/publishNote, bound to the actual
  // sendCuttingToPhoneBtn/sendNoteToPhoneBtn buttons) and had no live caller left --
  // removed rather than left as a second, easy-to-mistakenly-edit copy.
  // The phone-to-Studio direction below is still the live one.

  window.studioInboxPackets=async function(){
    try{
      const all=await firebaseGet(`${ROOT}/studioQueue`);
      if(!all)return [];
      return Object.values(all);
    }catch(e){console.error("Studio inbox read failed",e);return [];}
  };

  window.removeInboxPacket=async function(syncId){
    try{await firebaseDelete(`${ROOT}/studioQueue/${firebaseSafeKey(syncId)}`)}catch(e){console.error("Failed to remove site packet",e)}
  };

  const v=document.querySelector('.version');if(v)v.textContent='';
  document.title=document.title.replace(/AssembleOne Studio[^<]*/,'AssembleOne Studio 11.0.1 Cloud Sync');
})();


// --- block 18 ---

/* AssembleOne 10.89: separate reliable Supplier and Site Job sending */
(function(){
  const CHANNEL="mads_assembleone_1089";
  const ROOT=`sync_v3/${CHANNEL}`;
  window.ASSEMBLEONE_SYNC_CHANNEL=CHANNEL;
  function copy(v){return JSON.parse(JSON.stringify(v));}
  function counts(p){const units=Array.isArray(p?.cabinets)?p.cabinets:[];const panels=units.flatMap(c=>Array.isArray(c.parts)?c.parts:[]);return {rooms:Array.isArray(p?.rooms)?p.rooms.length:0,units:units.length,panels:panels.length,pieces:panels.reduce((n,x)=>n+Math.max(1,Number(x.qty)||1),0)};}
  async function publish(mode,button){
    const p=ensureSharedProject(project());
    if(!p)return alert(st('msg.openJobFirst'));
    const pn=document.getElementById("projectName"),cn=document.getElementById("customerName");
    if(pn&&pn.value.trim())p.name=pn.value.trim();
    if(cn&&cn.value.trim())p.customer=cn.value.trim();
    const n=counts(p);
    if(!n.units)return alert(st('msg.nothingSentNoUnit'));
    if(!n.panels)return alert(st('msg.nothingSentNoPanels'));
    if(mode==="cutting"){
      const allParts=(p.cabinets||[]).flatMap(c=>c.parts||[]);
      const notReady=typeof window.isCompleteSupplierPart==='function'?allParts.filter(x=>!window.isCompleteSupplierPart(x)).length:0;
      if(notReady&&!confirm(st('msg.confirmPanelsNotChecked',[notReady])))return;
    }
    p.bom=buildJobBom(p);
    p.cuttingList=(p.cabinets||[]).flatMap(c=>(c.parts||[]).map(pt=>({cabinetId:c.id,cabinetName:c.name,panelId:pt.id,code:pt.code,name:pt.name,thickness:pt.thickness,length:pt.length,width:pt.width,qty:Math.max(1,Number(pt.qty)||1),material:materialForPanel(pt)||pt.material||"",edgeLong:pt.edgeLong||0,edgeShort:pt.edgeShort||0,scannedQty:Number(pt.scannedQty)||0})));
    const isCut=mode==="cutting";
    // Jobs that started as a phone Site Job get split into one Studio project per room
    // (see mergeMobileSiteJob). Sending back just this one room's project would land on
    // the phone as a brand-new duplicate, since its id no longer matches the phone's
    // original project. Reassemble all sibling rooms under the original mobile id so the
    // phone recognises it as an update to the job it already has.
    let outgoingProject=p;
    if(p.siteMobileJobId){
      const siblings=state.projects.filter(x=>x.siteMobileJobId===p.siteMobileJobId);
      outgoingProject=copy(p);
      outgoingProject.id=p.siteMobileJobId;
      outgoingProject.rooms=siblings.flatMap(s=>s.rooms||[]);
      outgoingProject.cabinets=siblings.flatMap(s=>s.cabinets||[]);
    }
    const packet={app:"AssembleOne",schema:"assembleone-project-v10.89",source:"studio",sendType:isCut?"cutting-list":"site-job",exportedAt:new Date().toISOString(),includesCuttingList:isCut,openScreen:isCut?"scan":"drawings",summary:n,project:copy(outgoingProject),syncId:firebaseSafeKey(uid()),channel:CHANNEL};
    const old=button?button.innerHTML:"";
    if(button){button.disabled=true;button.dataset.oldHtml=old;button.innerHTML='<span>⏳</span><strong>Sending…</strong><small>Please wait</small>';}
    try{
      await firebasePut(`${ROOT}/mobileQueue/${firebaseSafeKey(packet.syncId)}`,packet);
      try{new BroadcastChannel("assembleone-sync").postMessage({type:"studio-published",syncId:packet.syncId,channel:CHANNEL})}catch(e){}
      p.lastMobileSync=packet.exportedAt;save();
      if(button){button.innerHTML='<span>✅</span><strong>Sent to Phone</strong><small>'+n.units+' unit · '+n.panels+' panels · '+n.pieces+' pieces</small>';setTimeout(()=>{button.innerHTML=old;button.disabled=false},2500);}
      alert(isCut?st('msg.cuttingListSent',[n.panels,n.pieces]):st('msg.siteJobSent',[n.rooms,n.units,n.panels,n.pieces]));
    }catch(e){console.error(e);if(button){button.innerHTML=old;button.disabled=false;}alert(st('msg.phoneConnectionFailed'));}
  }
  const supplier=document.getElementById("sendCuttingToPhoneBtn");
  if(supplier)supplier.onclick=function(e){e.preventDefault();publish("cutting",supplier)};
  async function publishNote(button){
    const p=ensureSharedProject(project());
    if(!p)return alert(st('msg.openJobFirst'));
    const noteBox=document.getElementById("finishPhoneNote");
    const note=(noteBox?noteBox.value:p.notes||"").trim();
    if(!note)return alert(st('msg.typeNoteFirst'));
    p.notes=note;save();
    const packet={app:"AssembleOne",schema:"assembleone-project-v10.89",source:"studio",sendType:"note",exportedAt:new Date().toISOString(),includesCuttingList:false,openScreen:"drawings",project:copy(p),syncId:firebaseSafeKey(uid()),channel:CHANNEL};
    const old=button?button.innerHTML:"";
    if(button){button.disabled=true;button.dataset.oldHtml=old;button.innerHTML='<span>⏳</span><strong>Sending…</strong><small>Please wait</small>';}
    try{
      await firebasePut(`${ROOT}/mobileQueue/${firebaseSafeKey(packet.syncId)}`,packet);
      try{new BroadcastChannel("assembleone-sync").postMessage({type:"studio-published",syncId:packet.syncId,channel:CHANNEL})}catch(e){}
      p.lastMobileSync=packet.exportedAt;save();
      if(button){button.innerHTML='<span>✅</span><strong>Note Sent</strong><small>The install team will see it</small>';setTimeout(()=>{button.innerHTML=old;button.disabled=false},2500);}
    }catch(e){console.error(e);if(button){button.innerHTML=old;button.disabled=false;}alert(st('msg.phoneConnectionFailed'));}
  }
  const noteBtn=document.getElementById("sendNoteToPhoneBtn");
  if(noteBtn)noteBtn.onclick=function(e){e.preventDefault();publishNote(noteBtn)};
  const noteField=document.getElementById("finishPhoneNote");
  if(noteField){noteField.value=project()?.notes||"";noteField.oninput=()=>{const p=project();if(p){p.notes=noteField.value;save()}}}
  const v=document.querySelector('.version');if(v)v.textContent='';
  document.title='AssembleOne Studio 11.0.1 Cloud Sync';
})();


// --- block 19 ---

(function(){
 function q(id){return document.getElementById(id)}
 function currentProject(){return typeof project==='function'?project():null}
 function updateHome(){
   const p=currentProject(),t=q('currentJobHomeText');
   if(t)t.textContent=p?(p.customer?`${p.customer} — ${p.name||st('home.currentJobFallback')}`:(p.name||st('home.currentJobFallback'))):st('home.openJobHint');
 }
 function showHome(){q('v12ProjectSetup')?.setAttribute('hidden','');q('v12TemplatesPanel')?.setAttribute('hidden','');q('v12RecentSection')?.removeAttribute('hidden');window.scrollTo({top:0,behavior:'smooth'})}
 function showSetup(){q('v12RecentSection')?.setAttribute('hidden','');q('v12TemplatesPanel')?.setAttribute('hidden','');q('v12ProjectSetup')?.removeAttribute('hidden');setTimeout(()=>q('v12ProjectSetup')?.scrollIntoView({behavior:'smooth',block:'start'}),30)}
 document.addEventListener('DOMContentLoaded',function(){
   const nb=q('newJobBtn');if(nb){nb.innerHTML='<img class="v123-card-art" src="data:image/png;base64,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" alt="Carpenter holding a project drawing"><span class="v123-card-copy"><strong>'+st('home.newProject')+'</strong><small>'+st('home.newProjectSub')+'</small></span><b>›</b>';const old=nb.onclick;nb.onclick=function(e){if(old)old.call(this,e);showSetup();updateHome()}}
   q('continueCurrentBtn')?.addEventListener('click',function(){showSetup()});
   q('siteJobsHomeBtn')?.addEventListener('click',function(){const panel=q('directSiteInbox');if(!panel)return;const opening=panel.hasAttribute('hidden');if(opening){panel.removeAttribute('hidden');setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'start'}),30)}else{panel.setAttribute('hidden','')}});
   q('settingsClearDataBtn')?.addEventListener('click',function(){
     if(!confirm(st('msg.confirmClearAllData')))return;
     state={projects:[],customers:[],currentProject:null,currentCabinet:null,currentPart:null,currentRoom:null,lastChosenPartName:"",numbering:false,screen:"jobs"};
     ["assembleone_direct_sync_queue_v1","assembleone_material_library_v1","assembleone_notes_library_v1","assembleone_default_thickness_mm"].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});
     try{localStorage.removeItem(STORE);sessionStorage.removeItem(STORE+'_draft')}catch(e){}
     function wipeDb(name){
       return new Promise(resolve=>{
         try{
           const req=indexedDB.open(name);
           req.onsuccess=()=>{
             const d=req.result;
             try{
               const names=Array.from(d.objectStoreNames);
               if(!names.length){d.close();resolve();return}
               const tx=d.transaction(names,'readwrite');
               names.forEach(n=>tx.objectStore(n).clear());
               tx.oncomplete=tx.onerror=()=>{d.close();resolve()};
             }catch(e){resolve()}
           };
           req.onerror=()=>resolve();
         }catch(e){resolve()}
       });
     }
     Promise.all([wipeDb('assembleone_stable_v1'),wipeDb('assembleone_direct_sync_v1')]).finally(()=>location.reload());
   });
   function paintUnitToggle(){document.querySelectorAll('.unit-choice').forEach(b=>b.classList.toggle('active',b.dataset.unit===(state.units||'mm')))}
   document.querySelectorAll('.unit-choice').forEach(b=>b.addEventListener('click',function(){state.units=b.dataset.unit;paintUnitToggle();if(typeof renderForm==='function')renderForm();if(typeof updateEdgePreview==='function')updateEdgePreview();save()}));
   paintUnitToggle();
   let templateReturnScreen='jobs'; function openTemplateCheck(returnTo){templateReturnScreen=returnTo||'jobs';show('jobs');q('v12RecentSection')?.setAttribute('hidden','');q('v12ProjectSetup')?.setAttribute('hidden','');q('v12TemplatesPanel')?.removeAttribute('hidden');setTimeout(()=>q('v12TemplatesPanel')?.scrollIntoView({behavior:'smooth',block:'start'}),30)} q('finishTemplateCheckBtn')?.addEventListener('click',function(){show('parts')}); q('v12CloseTemplates')?.addEventListener('click',function(){if(templateReturnScreen==='bom'){show('bom');window.scrollTo({top:0,behavior:'smooth'})}else showHome()});q('v12CloseSetup')?.addEventListener('click',showHome);
   q('v12ShowAllJobs')?.addEventListener('click',function(){q('jobGrid')?.scrollIntoView({behavior:'smooth',block:'start'})});
   updateHome();
   const oldRender=window.renderAll;if(oldRender)window.renderAll=function(){const r=oldRender.apply(this,arguments);setTimeout(updateHome,0);return r};
   window.updateHome=updateHome;
 });
})();


// --- block 20 ---

(function(){
  function bindZoomControls(){
    const plus=document.getElementById('zoomInBtn');
    const minus=document.getElementById('zoomOutBtn');
    const fit=document.getElementById('zoomFitBtn');
    if(!plus||!minus||!fit||typeof setRoomsZoom!=='function') return;
    plus.onclick=function(e){e.preventDefault();e.stopPropagation();setRoomsZoom(Number(state.drawingZoom||1)+0.25)};
    minus.onclick=function(e){e.preventDefault();e.stopPropagation();setRoomsZoom(Number(state.drawingZoom||1)-0.25)};
    fit.onclick=function(e){e.preventDefault();e.stopPropagation();state.drawingZoom=1;renderRooms();requestAnimationFrame(function(){document.getElementById('drawingStage')?.scrollTo({left:0,top:0})})};
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindZoomControls);
  else bindZoomControls();
})();


// --- block 21 ---

(function(){
  function bindPanelMarker(){
    const stage=document.getElementById('drawingStage');
    const canvas=document.getElementById('drawingCanvas');
    const image=document.getElementById('drawingImage');
    if(!stage||!canvas||canvas.dataset.a89MarkerBound==='1') return;
    canvas.dataset.a89MarkerBound='1';

    function refreshMarkerState(){
      const c=typeof cabinet==='function'?cabinet():null;
      canvas.classList.toggle('has-drawing',!!(c&&c.drawing&&c.drawingType!=='pdf'));
    }

    canvas.addEventListener('pointerenter',function(){refreshMarkerState();if(canvas.classList.contains('has-drawing'))canvas.classList.add('marker-ready')});
    canvas.addEventListener('pointerleave',function(){canvas.classList.remove('marker-ready')});

    canvas.addEventListener('click',function(e){
      if(e.target.closest('.pin')) return;
      const c=typeof cabinet==='function'?cabinet():null;
      if(!c||!c.drawing) return;
      if(c.drawingType==='pdf') return alert(st('msg.forMarkingPanelsUsePngJpg'));
      const r=canvas.getBoundingClientRect();
      if(!r.width||!r.height) return;
      const x=Math.max(0,Math.min(100,(e.clientX-r.left)/r.width*100));
      const y=Math.max(0,Math.min(100,(e.clientY-r.top)/r.height*100));
      e.preventDefault();
      e.stopImmediatePropagation();
      if(typeof createPartAt==='function') createPartAt(x,y);
    },true);

    const originalRenderRooms=window.renderRooms;
    if(typeof originalRenderRooms==='function'&&!originalRenderRooms.__a89Wrapped){
      const wrapped=function(){const result=originalRenderRooms.apply(this,arguments);requestAnimationFrame(refreshMarkerState);return result};
      wrapped.__a89Wrapped=true;
      window.renderRooms=wrapped;
    }
    refreshMarkerState();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bindPanelMarker);
  else bindPanelMarker();
})();


// --- block 22 ---

(function(){
  function restoreOrder(){
    const form=document.querySelector('#screen-mark .panel-form');
    const measure=document.querySelector('#screen-mark .measurement-entry-card');
    const quick=document.querySelector('#screen-mark .quick-main');
    const library=document.querySelector('#screen-mark .common-part-library');
    const toolbar=document.querySelector('#screen-mark .panel-action-toolbar');
    const meta=document.querySelector('#screen-mark .measure-meta-box');
    const save=document.getElementById('saveNextBtn');
    const options=document.querySelector('#screen-mark .panel-options');
    const del=document.getElementById('deletePartBtn');
    const list=document.getElementById('partList');
    if(!form||!measure||!quick||!library||!meta||!save)return;
    let saveRow=document.querySelector('#screen-mark .a93-save-row');
    if(!saveRow){saveRow=document.createElement('div');saveRow.className='a93-save-row';}
    saveRow.append(save);
    if(del)saveRow.append(del);
    // Left/Right, Top/Bottom, Back and Chosen Parts now live beside the
    // Quantity box (inside .qty-actions-row) instead of their own row below
    // -- keep that nesting instead of pulling quick back out on every pass.
    const qtyRow=document.querySelector('#screen-mark .qty-actions-row');
    if(qtyRow)qtyRow.append(quick);else measure.append(quick);
    [measure,library,meta,saveRow,options,list].forEach(el=>{if(el)form.append(el)});
    if(toolbar && toolbar.children.length===0)toolbar.remove();
  }
  function closeNameMenus(){
    document.querySelectorAll('#screen-mark .quick-pop').forEach(x=>x.classList.remove('open'));
    const chosen=document.querySelector('#screen-mark .chosen-parts');if(chosen)chosen.open=false;
    const library=document.querySelector('#screen-mark .common-part-library');if(library)library.open=false;
  }
  document.addEventListener('click',function(e){
    const name=e.target.closest&&e.target.closest('#screen-mark [data-quick-name]');
    if(name)setTimeout(closeNameMenus,0);
  },true);
  const picker=document.getElementById('partNamePicker');
  if(picker){picker.addEventListener('change',()=>setTimeout(closeNameMenus,0));picker.addEventListener('keydown',e=>{if(e.key==='Enter')setTimeout(closeNameMenus,0)})}

  function installZoom(){
    if(typeof renderRooms!=='function')return;
    window.a93SizeDrawing=function(){
      const c=typeof cabinet==='function'?cabinet():null,stage=document.getElementById('drawingStage'),canvas=document.getElementById('drawingCanvas'),img=document.getElementById('drawingImage');
      if(!stage||!canvas||!img||!c?.drawing)return;
      const z=Math.max(.25,Math.min(4,Number(state.drawingZoom||1)));
      const pad=28,aw=Math.max(260,stage.clientWidth-pad),ah=Math.max(260,stage.clientHeight-pad);
      const nw=img.naturalWidth||aw,nh=img.naturalHeight||ah;
      const fit=Math.min(aw/nw,ah/nh);
      canvas.style.width=Math.max(180,Math.round(nw*fit*z))+'px';
      canvas.style.height=Math.max(180,Math.round(nh*fit*z))+'px';
    };
    const oldRender=renderRooms;
    window.renderRooms=function(){const r=oldRender();requestAnimationFrame(window.a93SizeDrawing);return r};
    const img=document.getElementById('drawingImage');if(img)img.addEventListener('load',()=>requestAnimationFrame(window.a93SizeDrawing));
    const plus=document.getElementById('zoomInBtn'),minus=document.getElementById('zoomOutBtn'),fit=document.getElementById('zoomFitBtn');
    if(plus)plus.onclick=e=>{e.preventDefault();e.stopPropagation();setRoomsZoom(Number(state.drawingZoom||1)+.25)};
    if(minus)minus.onclick=e=>{e.preventDefault();e.stopPropagation();setRoomsZoom(Number(state.drawingZoom||1)-.25)};
    if(fit)fit.onclick=e=>{e.preventDefault();e.stopPropagation();state.drawingZoom=1;renderRooms();requestAnimationFrame(()=>document.getElementById('drawingStage')?.scrollTo({left:0,top:0}))};
  }
  restoreOrder();installZoom();
  setTimeout(()=>{restoreOrder();if(typeof renderRooms==='function')renderRooms()},50);
})();


// --- block 23 ---

(function(){
  const order=['jobs','mark','parts','cutting','qr','bom'];
  const labels=()=>[st('step.start'),st('step.drawing'),st('step.panels'),st('step.cuttingList'),st('step.qrLabels'),st('step.finish')];
  const storageKey=()=> 'assembleone-checklist-'+String((window.state&&state.currentProject)||'current');
  const readStored=()=>{try{return JSON.parse(localStorage.getItem(storageKey())||'[false,false,false,false,false,false]')}catch(e){return [false,false,false,false,false,false]}};
  const writeStored=a=>{try{localStorage.setItem(storageKey(),JSON.stringify(a))}catch(e){}};
  const val=(id,fallback='')=>{const el=document.getElementById(id);return String(el?el.value:(fallback||'')).trim()};
  const getProject=()=>{try{return project()}catch(e){return null}};
  const named=x=>!!String(x&&x.name||'').trim();
  const measured=x=>named(x)&&Number(x.length)>0&&Number(x.width)>0&&Number(x.thickness)>0&&Number(x.qty||1)>0;
  function actual(){
    const p=getProject();
    const cabinets=(p&&p.cabinets)||[];
    const parts=cabinets.flatMap(c=>c.parts||[]);
    const start=!!(val('projectName',p&&p.name)&&val('customerName',p&&p.customer));
    const drawing=!!cabinets.some(c=>c&&c.drawing);
    const panels=!!parts.some(named);
    const cutting=!!(parts.length&&parts.every(measured));
    const qr=!!(p&&p.qrReady);
    return [start,drawing,panels,cutting,qr,start&&drawing&&panels&&cutting&&qr];
  }
  function persistFields(){
    const p=getProject(); if(!p)return;
    const n=document.getElementById('projectName'), c=document.getElementById('customerName');
    let changed=false;
    if(n&&p.name!==n.value){p.name=n.value;changed=true}
    if(c&&p.customer!==c.value){p.customer=c.value;changed=true}
    if(changed){try{save()}catch(e){}}
  }
  function paint(screen){
    persistFields();
    const now=actual();
    const old=readStored();
    // A step stays checked after completion, but is cleared if its required data is actually removed.
    const ready=now.map((v,i)=>!!v);
    writeStored(ready);
    const active=order.indexOf(screen||(window.state&&state.screen)||'jobs');
    document.querySelectorAll('#workflowProgress [data-step-screen]').forEach((el,i)=>{
      const done=!!ready[i];
      el.classList.toggle('complete',done);
      el.classList.toggle('current',i===active&&!done);
      const badge=el.querySelector('.workflow-status');
      if(badge){badge.textContent=done?'✓':String(i+1);badge.style.fontSize=''}
      el.setAttribute('aria-label',labels()[i]+(done?st('common.completeSuffix'):st('common.notCompleteSuffix')));
    });
    ['exportMobileBtn','bomExportBtn','refreshBomBtn'].forEach(id=>{const b=document.getElementById(id);if(b){b.disabled=!ready[5];b.title=ready[5]?st('common.readyToSend'):st('common.completeEveryStepFirst')}});
    return ready;
  }
  window.updateWorkflowProgress=paint;
  document.addEventListener('input',e=>{if(e.target&&['projectName','customerName'].includes(e.target.id))paint('jobs')},true);
  document.addEventListener('change',()=>setTimeout(()=>paint(),0),true);
  document.addEventListener('click',()=>setTimeout(()=>paint(),60),true);
  window.addEventListener('focus',()=>paint());
  setTimeout(()=>paint(),0);
})();


// --- block 24 ---

/* Version 10.5: menu buttons only open their choices. Exact names are applied by the option buttons. */
(function(){
  function closeAllNameMenus(){
    document.querySelectorAll('#screen-mark .quick-pop').forEach(x=>x.classList.remove('open'));
    const chosen=document.querySelector('#screen-mark .chosen-parts'); if(chosen)chosen.open=false;
    const more=document.querySelector('#screen-mark .common-part-library'); if(more)more.open=false;
  }
  document.addEventListener('click',function(e){
    const option=e.target.closest&&e.target.closest('#screen-mark .quick-pop [data-quick-name], #screen-mark .common-part-library [data-quick-name], #screen-mark .quick-main-btn[data-quick-name]');
    if(!option)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(typeof setPartName==='function')setPartName(option.dataset.quickName);
    closeAllNameMenus();
  },true);
})();


// --- block 25 ---

(function(){
  const oldRenderRooms=window.renderRooms;
  function applyTrueDrawingZoom(){
    const stage=document.getElementById('drawingStage');
    const canvas=document.getElementById('drawingCanvas');
    const img=document.getElementById('drawingImage');
    const pdf=document.getElementById('drawingPdf');
    if(!stage||!canvas)return;
    const c=(typeof cabinet==='function')?cabinet():null;
    const zoom=Math.max(.25,Math.min(4,Number((window.state&&state.drawingZoom)||1)));
    const pad=28;
    const availableW=Math.max(120,stage.clientWidth-pad);
    const availableH=Math.max(120,stage.clientHeight-pad);
    let baseW=availableW,baseH=availableH;
    if(c&&c.drawingType!=='pdf'&&img&&img.naturalWidth&&img.naturalHeight){
      const fit=Math.min(availableW/img.naturalWidth,availableH/img.naturalHeight,1);
      baseW=Math.max(180,Math.round(img.naturalWidth*fit));
      baseH=Math.max(180,Math.round(img.naturalHeight*fit));
    }
    canvas.style.setProperty('width',Math.round(baseW*zoom)+'px','important');
    canvas.style.setProperty('height',Math.round(baseH*zoom)+'px','important');
    if(img){
      img.style.setProperty('width','100%','important');
      img.style.setProperty('height','100%','important');
      img.style.setProperty('position','static','important');
    }
    if(pdf){pdf.style.setProperty('width','100%','important');pdf.style.setProperty('height','100%','important')}
    const zv=document.getElementById('zoomValue');if(zv)zv.textContent=Math.round(zoom*100)+'%';
  }
  if(typeof oldRenderRooms==='function'){
    window.renderRooms=function(){
      const out=oldRenderRooms.apply(this,arguments);
      requestAnimationFrame(applyTrueDrawingZoom);
      const img=document.getElementById('drawingImage');
      if(img&&!img.dataset.a104zoom){img.dataset.a104zoom='1';img.addEventListener('load',()=>requestAnimationFrame(applyTrueDrawingZoom))}
      return out;
    };
    try{renderRooms=window.renderRooms}catch(e){}
  }
  function panelComplete(p){return !!(String(p&&p.name||'').trim()&&Number(p.length)>0&&Number(p.width)>0&&Number(p.thickness)>0&&Number(p.qty||1)>0)}
  window.renderParts=function(){
    const c=(typeof cabinet==='function')?cabinet():null;
    const box=document.getElementById('partsSummary');
    const warning=document.getElementById('componentsValidation');
    if(!box)return;
    const rows=(c&&c.parts)||[];
    const complete=rows.filter(panelComplete).length;
    const missing=rows.length-complete;
    if(warning){warning.style.display=missing?'block':'none';warning.textContent=missing?st('common.panelsNeedMoreInfo',[missing]):''}
    if(!rows.length){box.innerHTML=`<div class="empty">${st('common.noPanelsYetReturnDrawing')}</div>`;return}
    box.innerHTML=`<div class="panel-check-summary">${st('common.panelsReadyCount',[complete,rows.length])}</div><div class="panel-check-grid">`+rows.map(p=>{
      const ok=panelComplete(p);
      const measurements=`${p.length||'—'} × ${p.width||'—'} × ${p.thickness||'—'} mm · ${st('common.qty')} ${p.qty||1}`;
      const edge=st('common.longShortEdges',[Number(p.edgeLong||0),Number(p.edgeShort||0)]);
      const statusLabel=({ready:st('status.ready'),installed:st('status.installed'),missing:st('status.missing'),damaged:st('status.damaged')})[p.status]||p.status||st('status.ready');
      const notes=String(p.notes||'').trim();
      return `<div class="panel-check-card ${ok?'complete':'incomplete'}"><div class="panel-check-code">${safe(p.code||'')}</div><div class="panel-check-content"><div class="panel-check-name">${safe(p.name||st('common.unnamedPart'))}</div><div class="panel-check-meta"><strong>${st('common.measurementsLabel')}</strong> ${measurements}<br><strong>${st('common.material')}</strong> ${safe(materialForPanel(p)||st('common.notSet'))}<br><strong>${st('common.edging')}</strong> ${edge}<br><strong>${st('common.status')}</strong> ${safe(statusLabel)}${notes?`<br><strong>${st('common.notes')}</strong> ${safe(notes)}`:''}</div></div><div class="panel-check-actions"><span class="panel-check-status">${ok?'✓':'⚠'}</span><button class="btn" data-edit-panel="${p.id}">${st('common.editBtn')}</button></div></div>`;
    }).join('')+'</div>';
    box.querySelectorAll('[data-edit-panel]').forEach(b=>b.addEventListener('click',()=>{state.currentPart=b.dataset.editPanel;state.selectedCopy=-1;state.focusMarker=true;save();renderAll();show('mark')}));
  };
  try{renderParts=window.renderParts}catch(e){}
  function renamePanelLabels(){
    document.querySelectorAll('[data-step-screen="parts"]').forEach(el=>{el.childNodes.forEach(n=>{if(n.nodeType===3&&n.textContent.includes(st('step.panels')))n.textContent=n.textContent.replace(st('step.panels'),st('common.panelCheck'))});el.title=st('common.openStepPrefix')+st('common.panelCheck')});
    document.querySelectorAll('.nav-btn[data-screen="parts"]').forEach(el=>el.title=st('common.panelCheck'));
  }
  document.addEventListener('click',e=>{
    if(e.target.closest('#checkAllPanelsBtn')){e.preventDefault();const mi=document.getElementById('materialCustomInput');if(mi&&mi.value.trim())mi.dispatchEvent(new Event('blur'));if(typeof save==='function')save();if(typeof renderParts==='function')renderParts();show('parts');renamePanelLabels()}
  });
  const oldRenderAll=window.renderAll;
  if(typeof oldRenderAll==='function'){
    window.renderAll=function(){const out=oldRenderAll.apply(this,arguments);renamePanelLabels();requestAnimationFrame(applyTrueDrawingZoom);return out};
    try{renderAll=window.renderAll}catch(e){}
  }
  renamePanelLabels();
  requestAnimationFrame(()=>{applyTrueDrawingZoom();if(typeof renderParts==='function')renderParts()});
})();


// --- block 26 ---

(function(){
  function placePanelCheck(){
    const form=document.querySelector('#screen-mark .panel-form');
    const saveRow=document.querySelector('#screen-mark .a93-save-row');
    const save=document.getElementById('saveNextBtn');
    const del=document.getElementById('deletePartBtn');
    const check=document.getElementById('checkAllPanelsBtn');
    const options=document.querySelector('#screen-mark .panel-options');
    const list=document.getElementById('partList');
    if(!form||!saveRow||!check)return;
    if(save)saveRow.append(save);
    if(del)saveRow.append(del);
    saveRow.append(check);
    if(options)form.append(options);
    if(list)form.append(list);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',placePanelCheck);
  else placePanelCheck();
  setTimeout(placePanelCheck,50);
})();


// --- block 27 ---

(function(){
  function currentPanel(){ return typeof part==='function' ? part() : null; }
  function currentProject(){ return typeof project==='function' ? project() : null; }
  function currentUnit(){ return typeof cabinet==='function' ? cabinet() : null; }

  window.commitAssembleOneMaterial=function(rawName){
    const name=String(rawName||'').trim();
    if(!name)return false;
    const p=currentPanel(),pr=currentProject(),c=currentUnit();
    if(p)p.material=name;
    if(pr)pr.defaultMaterial=name;
    if(c)c.lastMaterial=name;
    if(typeof storeMaterialName==='function')storeMaterialName(name);
    const hidden=document.getElementById('fMaterial');
    if(hidden){hidden.value=name;hidden.dispatchEvent(new Event('input',{bubbles:true}));hidden.dispatchEvent(new Event('change',{bubbles:true}));}
    const input=document.getElementById('materialCustomInput');
    if(input)input.value='';
    const summary=document.getElementById('materialSummary');
    if(summary)summary.textContent=st('drawing.materialPrefix')+' — '+name;
    const details=document.getElementById('materialPickerDetails');
    if(details){details.open=false;details.removeAttribute('open');}
    if(typeof save==='function')save();
    if(typeof renderMaterialPicker==='function')renderMaterialPicker();
    if(details){details.open=false;details.removeAttribute('open');}
    requestAnimationFrame(()=>{
      const d=document.getElementById('materialPickerDetails');
      const sm=document.getElementById('materialSummary');
      if(sm)sm.textContent=st('drawing.materialPrefix')+' — '+name;
      if(d){d.open=false;d.removeAttribute('open');}
    });
    return true;
  };

  document.addEventListener('click',function(e){
    const saveBtn=e.target.closest('#saveMaterialBtn');
    if(saveBtn){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      const input=document.getElementById('materialCustomInput');
      window.commitAssembleOneMaterial(input?input.value:'');
      return;
    }
    const choice=e.target.closest('[data-material-name]');
    if(choice){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      window.commitAssembleOneMaterial(choice.getAttribute('data-material-name'));
    }
  },true);

  document.addEventListener('keydown',function(e){
    if(e.target && e.target.id==='materialCustomInput' && e.key==='Enter'){
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
      window.commitAssembleOneMaterial(e.target.value);
    }
  },true);

  document.addEventListener('click',function(e){
    if(!e.target.closest('#saveNextBtn'))return;
    const input=document.getElementById('materialCustomInput');
    if(input && input.value.trim())window.commitAssembleOneMaterial(input.value);
  },true);
})();


// --- block 28 ---

(function(){
  function sig(p){
    return [p&&p.name,p&&p.length,p&&p.width,p&&p.thickness,p&&p.qty,p&&p.material,p&&p.edgeLong||0,p&&p.edgeShort||0,p&&p.notes||'',p&&p.status||'ready'].map(v=>String(v??'').trim()).join('|');
  }
  function baseMissing(p){
    const m=[];
    if(!String(p&&p.name||'').trim())m.push('Part name');
    if(!(Number(p&&p.length)>0))m.push('Length');
    if(!(Number(p&&p.width)>0))m.push('Width');
    if(!(Number(p&&p.thickness)>0))m.push('Thickness');
    if(!(Number(p&&p.qty)>0))m.push('Quantity');
    if(!String((typeof materialForPanel==='function'?materialForPanel(p):p&&p.material)||'').trim())m.push('Material');
    return m;
  }
  function reviewed(p){return !!(p&&p.reviewSignature&&p.reviewSignature===sig(p));}
  function readyForSupplier(p){return baseMissing(p).length===0&&reviewed(p);}
  window.panelReviewSignature=sig;
  window.panelIsReviewed=reviewed;
  window.panelMissingItems=baseMissing;

  // One source of truth: a supplier panel must have its data and a deliberate final check.
  window.isCompleteSupplierPart=readyForSupplier;
  try{isCompleteSupplierPart=window.isCompleteSupplierPart}catch(e){}
  window.supplierParts=function(){return (typeof cabinetParts==='function'?cabinetParts():[]).filter(readyForSupplier)};
  try{supplierParts=window.supplierParts}catch(e){}

  function defaultChecklistItems(){return [st('partname.Left-hand side'),st('partname.Right-hand side'),st('partname.Top'),st('partname.Bottom'),st('partname.Back panel')].map(name=>({name,done:false}))}
  function defaultHardwareItems(){return [st('hardware.hinges'),st('hardware.handles'),st('partname.Hanging rail'),st('hardware.shelfPins'),st('hardware.ledLights'),st('hardware.ledDriverTransformer'),st('hardware.screwsFixings')].map(name=>({name,done:false}))}
  function panelNameMatches(c,name){
    const target=(name||'').trim().toLowerCase();
    if(!target)return false;
    return ((c&&c.parts)||[]).some(p=>(p.name||'').trim().toLowerCase()===target);
  }
  function distinctPanelNames(c){
    const seen=new Set(),names=[];
    ((c&&c.parts)||[]).forEach(p=>{
      const n=(p.name||'').trim();
      if(n&&!seen.has(n.toLowerCase())){seen.add(n.toLowerCase());names.push(n)}
    });
    return names;
  }
  function checklistHtml(c){
    if(!c)return'';
    if(!Array.isArray(c.checklist))c.checklist=defaultChecklistItems();
    const rows=c.checklist;
    const checklistNames=new Set(rows.map(r=>(r.name||'').trim().toLowerCase()));
    const extraAuto=distinctPanelNames(c).filter(n=>!checklistNames.has(n.toLowerCase()));
    const autoDone=rows.filter(item=>panelNameMatches(c,item.name)).length+extraAuto.length;
    const manualDone=rows.filter(item=>!panelNameMatches(c,item.name)&&item.done).length;
    const done=autoDone+manualDone;
    const total=rows.length+extraAuto.length;
    const autoItems=extraAuto.map(n=>`<div class="build-checklist-row build-checklist-auto"><span class="build-checklist-tick">✓</span><span>${safe(n)}</span><small>${st('common.addedOnDrawing')}</small></div>`).join('');
    const presetItems=rows.map((item,i)=>{
      const matched=panelNameMatches(c,item.name);
      if(matched){
        return `<div class="build-checklist-row build-checklist-auto"><span class="build-checklist-tick">✓</span><span>${safe(item.name)}</span><small>${st('common.addedOnDrawing')}</small><button aria-label="${st('common.remove')}" class="build-checklist-remove" data-checklist-remove="${i}" type="button">✕</button></div>`;
      }
      return `<label class="build-checklist-row"><input data-checklist-toggle="${i}" type="checkbox" ${item.done?'checked':''}><span>${safe(item.name)}</span><button aria-label="${st('common.remove')}" class="build-checklist-remove" data-checklist-remove="${i}" type="button">✕</button></label>`;
    }).join('');
    return `<div class="build-checklist-card"><div class="build-checklist-head"><strong>${st('common.buildChecklistHeading')}</strong><span>${st('common.tickedOffCount',[done,total])}</span></div><div class="muted" style="margin:-4px 0 10px;font-size:12px">${st('common.autoPickedUpHint')}</div><div class="build-checklist-list">${autoItems}${presetItems}</div><div class="build-checklist-add"><input id="newChecklistItemInput" placeholder="${st('common.addOwnElectricalPlaceholder')}" type="text"><button class="btn" id="addChecklistItemBtn" type="button">${st('common.addBtnPlus')}</button></div></div>`;
  }
  function hardwareChecklistHtml(c){
    if(!c)return'';
    if(!Array.isArray(c.hardwareChecklist))c.hardwareChecklist=defaultHardwareItems();
    const rows=c.hardwareChecklist;
    const done=rows.filter(i=>i.done).length;
    const items=rows.map((item,i)=>`<label class="hardware-checklist-row"><input data-hw-toggle="${i}" type="checkbox" ${item.done?'checked':''}><span>${safe(item.name)}</span><input class="hardware-checklist-qty" data-hw-qty="${i}" type="number" min="0" inputmode="numeric" placeholder="${st('common.qty')}" value="${item.qty!=null&&item.qty!==''?safe(item.qty):''}"><button aria-label="${st('common.remove')}" class="build-checklist-remove" data-hw-remove="${i}" type="button">✕</button></label>`).join('');
    return `<div class="hardware-checklist-card"><div class="build-checklist-head"><strong>${st('common.hardwareChecklistHeading')}</strong><span>${st('common.tickedOffCount',[done,rows.length])}</span></div><div class="build-checklist-list">${items}</div><div class="build-checklist-add"><input id="newHwItemInput" placeholder="${st('common.addOwnSoftClosePlaceholder')}" type="text"><button class="btn" id="addHwItemBtn" type="button">${st('common.addBtnPlus')}</button></div></div>`;
  }
  document.addEventListener('click',e=>{
    const remove=e.target.closest('[data-checklist-remove]');
    const add=e.target.closest('#addChecklistItemBtn');
    const hwRemove=e.target.closest('[data-hw-remove]');
    const hwAdd=e.target.closest('#addHwItemBtn');
    const c=(typeof cabinet==='function')?cabinet():null;
    if(!c)return;
    if(remove){
      const i=Number(remove.dataset.checklistRemove);
      if(c.checklist){c.checklist.splice(i,1);save();renderParts()}
    } else if(add){
      const input=document.getElementById('newChecklistItemInput');
      const name=(input?.value||'').trim();
      if(!name)return;
      if(!Array.isArray(c.checklist))c.checklist=defaultChecklistItems();
      c.checklist.push({name,done:false});
      save();renderParts();
    } else if(hwRemove){
      const i=Number(hwRemove.dataset.hwRemove);
      if(c.hardwareChecklist){c.hardwareChecklist.splice(i,1);save();renderParts()}
    } else if(hwAdd){
      const input=document.getElementById('newHwItemInput');
      const name=(input?.value||'').trim();
      if(!name)return;
      if(!Array.isArray(c.hardwareChecklist))c.hardwareChecklist=defaultHardwareItems();
      c.hardwareChecklist.push({name,done:false});
      save();renderParts();
    }
  });
  document.addEventListener('change',e=>{
    const toggle=e.target.closest('[data-checklist-toggle]');
    const hwToggle=e.target.closest('[data-hw-toggle]');
    const c=(typeof cabinet==='function')?cabinet():null;
    if(!c)return;
    if(toggle&&c.checklist){
      const i=Number(toggle.dataset.checklistToggle);
      if(c.checklist[i]){c.checklist[i].done=toggle.checked;save();renderParts()}
    } else if(hwToggle&&c.hardwareChecklist){
      const i=Number(hwToggle.dataset.hwToggle);
      if(c.hardwareChecklist[i]){c.hardwareChecklist[i].done=hwToggle.checked;save();renderParts()}
    }
  });
  document.addEventListener('input',e=>{
    const hwQty=e.target.closest('[data-hw-qty]');
    if(!hwQty)return;
    const c=(typeof cabinet==='function')?cabinet():null;
    if(!c||!c.hardwareChecklist)return;
    const i=Number(hwQty.dataset.hwQty);
    if(c.hardwareChecklist[i]){c.hardwareChecklist[i].qty=hwQty.value===''?'':Number(hwQty.value);save()}
  });

  function saveAsTemplate(c,name){
    if(!Array.isArray(state.templates))state.templates=[];
    const panels=(c.parts||[]).map(p=>({name:p.name||'',thickness:p.thickness||'',length:p.length||'',width:p.width||'',qty:p.qty||1,material:p.material||'',edgeLong:p.edgeLong||0,edgeShort:p.edgeShort||0}));
    const hardware=(Array.isArray(c.hardwareChecklist)?c.hardwareChecklist:defaultHardwareItems()).map(h=>({name:h.name,qty:h.qty!=null?h.qty:''}));
    state.templates.push({id:uid(),name,panels,hardware,savedAt:new Date().toISOString()});
    save();
  }
  function applyTemplateToCabinet(c,tpl){
    c.parts=c.parts||[];
    let n=c.parts.length;
    tpl.panels.forEach(bp=>{
      n++;
      c.parts.push({id:uid(),code:'P-'+String(n).padStart(3,'0'),name:bp.name,thickness:bp.thickness,length:bp.length,width:bp.width,qty:bp.qty||1,material:bp.material||'',edgeLong:bp.edgeLong||0,edgeShort:bp.edgeShort||0,status:'ready'});
    });
    c.hardwareChecklist=tpl.hardware.map(h=>({name:h.name,done:false,qty:h.qty!=null?h.qty:''}));
    save();
  }
  window.offerTemplatePicker=function(c,onDone){
    const templates=state.templates||[];
    const overlay=document.createElement('div');
    overlay.className='a100-edit-dialog';
    overlay.innerHTML=`<div class="a100-edit-sheet"><h2>${st('common.useSavedTemplateHeading')}</h2><div class="muted" style="margin-top:-6px">${st('common.startFromPreviousHint')}</div><div class="template-picker-list">${templates.map(t=>`<button class="template-picker-item" data-template-id="${t.id}" type="button"><strong>${safe(t.name)}</strong><small>${st('common.panelsHardwareCount',[t.panels.length,t.hardware.length])}</small></button>`).join('')}</div><div class="a100-edit-actions"><button class="btn" id="templatePickerSkip">${st('common.startBlankBtn')}</button></div></div>`;
    document.body.appendChild(overlay);
    const close=()=>overlay.remove();
    overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
    overlay.querySelector('#templatePickerSkip').onclick=()=>{close();onDone()};
    overlay.querySelectorAll('[data-template-id]').forEach(btn=>{
      btn.onclick=()=>{
        const tpl=templates.find(t=>t.id===btn.dataset.templateId);
        if(tpl)applyTemplateToCabinet(c,tpl);
        close();onDone();
      };
    });
  };
  document.addEventListener('click',e=>{
    const btn=e.target.closest('#saveAsTemplateBtn');
    if(!btn)return;
    const c=(typeof cabinet==='function')?cabinet():null;
    if(!c||!(c.parts||[]).length){alert(st('msg.addPanelBeforeTemplate'));return}
    const overlay=document.createElement('div');
    overlay.className='a100-edit-dialog';
    overlay.innerHTML=`<div class="a100-edit-sheet"><h2>${st('common.saveAsTemplateHeading')}</h2><label>${st('common.templateNameLabel')}<input id="templateNameInput" placeholder="${st('common.templateNamePlaceholder')}"></label><div class="a100-edit-actions"><button class="btn" id="templateSaveCancel">${st('common.cancelBtn')}</button><button class="btn primary" id="templateSaveConfirm">${st('common.saveTemplateBtn')}</button></div></div>`;
    document.body.appendChild(overlay);
    const close=()=>overlay.remove();
    overlay.addEventListener('click',ev=>{if(ev.target===overlay)close()});
    overlay.querySelector('#templateSaveCancel').onclick=close;
    overlay.querySelector('#templateSaveConfirm').onclick=()=>{
      const name=(document.getElementById('templateNameInput').value||'').trim();
      if(!name)return;
      saveAsTemplate(c,name);
      close();
      renderParts();
    };
    setTimeout(()=>document.getElementById('templateNameInput')?.focus(),30);
  });
  window.renderParts=function(){
    const c=(typeof cabinet==='function')?cabinet():null;
    const box=document.getElementById('partsSummary');
    const warning=document.getElementById('componentsValidation');
    if(!box)return;
    const rows=(c&&c.parts)||[];
    const complete=rows.filter(readyForSupplier).length;
    const missing=rows.length-complete;
    if(warning){
      warning.style.display=missing?'block':'none';
      warning.innerHTML=missing?`⚠ ${missing} panel${missing===1?' needs':'s need'} a final check before the cutting list.`:'';
    }
    if(!rows.length){box.innerHTML=checklistHtml(c)+hardwareChecklistHtml(c)+`<div class="empty">${st('common.noPanelsYetReturnDrawing')}</div>`;return;}
    box.innerHTML=checklistHtml(c)+hardwareChecklistHtml(c)+`<div class="save-template-row"><button class="btn" id="saveAsTemplateBtn" type="button">💾 Save this wardrobe as a template</button></div><div class="panel-check-summary">${complete} of ${rows.length} panels checked and ready</div><div class="panel-review-instruction">Double-click the large warning on every panel after checking the measurements, material, quantity and edging. Every panel needs a green tick before it can enter the cutting list.</div><div class="panel-check-grid">`+rows.map(p=>{
      const missingFields=baseMissing(p);
      const isReviewed=reviewed(p);
      const ok=missingFields.length===0&&isReviewed;
      const measurements=`${p.length||'—'} × ${p.width||'—'} × ${p.thickness||'—'} mm · ${st('common.qty')} ${p.qty||'—'}`;
      const edge=st('common.longShortEdges',[Number(p.edgeLong||0),Number(p.edgeShort||0)]);
      const statusLabel=({ready:st('status.ready'),installed:st('status.installed'),missing:st('status.missing'),damaged:st('status.damaged')})[p.status]||p.status||st('status.ready');
      const notes=String(p.notes||'').trim();
      const reviewMissing=missingFields.length?missingFields:[st('common.edgingConfirmationNeeded')];
      const chips=!ok?`<div class="panel-missing-list">${reviewMissing.map(x=>`<span class="panel-missing-chip">⚠ ${safe(x)}</span>`).join('')}</div>`:'';
      const reviewBox=ok
        ? `<div class="panel-review-ok"><span class="review-icon">✓</span><span class="review-title">${st('common.panelCheckedLabel')}</span></div>`
        : `<div class="panel-review-warning" data-review-panel="${p.id}" title="${st('common.doubleClickApprovePanel')}"><span class="review-icon">⚠</span><span class="review-title">${st('common.panelNotCheckedLabel')}</span><span class="review-help">${st('common.doubleClickAfterChecking')}</span></div>`;
      return `<div class="panel-check-card ${ok?'complete':'incomplete'}"><div class="panel-check-code">${safe(p.code||'')}</div><div class="panel-check-content"><div class="panel-check-name">${safe(p.name||st('common.unnamedPart'))}</div><div class="panel-check-meta"><strong>${st('common.measurementsLabel')}</strong> ${measurements}<br><strong>${st('common.material')}</strong> ${safe((typeof materialForPanel==='function'?materialForPanel(p):p.material)||st('common.notSet'))}<br><strong>${st('common.edging')}</strong> ${edge}<br><strong>${st('common.status')}</strong> ${safe(statusLabel)}${notes?`<br><strong>${st('common.notes')}</strong> ${safe(notes)}`:''}</div>${chips}</div><div class="panel-check-actions">${reviewBox}<button class="btn" data-edit-panel="${p.id}">${st('common.editPanelBtn')}</button></div></div>`;
    }).join('')+'</div>';

    box.querySelectorAll('[data-edit-panel]').forEach(b=>b.addEventListener('click',()=>{
      state.currentPart=b.dataset.editPanel;state.selectedCopy=-1;state.focusMarker=true;
      if(typeof save==='function')save();if(typeof renderAll==='function')renderAll();if(typeof show==='function')show('mark');
    }));
    box.querySelectorAll('[data-review-panel]').forEach(el=>el.addEventListener('dblclick',()=>{
      const p=rows.find(x=>String(x.id)===String(el.dataset.reviewPanel));
      if(!p)return;
      const miss=baseMissing(p);
      if(miss.length){
        state.currentPart=p.id;state.selectedCopy=-1;state.focusMarker=true;
        if(typeof save==='function')save();if(typeof renderAll==='function')renderAll();if(typeof show==='function')show('mark');
        setTimeout(()=>alert(st('msg.pleaseAddMissing',[miss.join(', ')])),50);
        return;
      }
      p.reviewSignature=sig(p);
      if(typeof save==='function')save();
      window.renderParts();
      if(typeof renderCutting==='function')renderCutting();
      if(typeof updateWorkflowProgress==='function')updateWorkflowProgress();
    }));
  };
  try{renderParts=window.renderParts}catch(e){}

  // Any edit invalidates the old check automatically because the signature changes.
  document.addEventListener('input',function(e){
    if(!e.target.closest('#screen-mark'))return;
    const p=(typeof part==='function')?part():null;
    if(p&&p.reviewSignature&&p.reviewSignature!==sig(p))p.reviewSignature='';
  },true);
  document.addEventListener('change',function(e){
    if(!e.target.closest('#screen-mark'))return;
    const p=(typeof part==='function')?part():null;
    if(p&&p.reviewSignature&&p.reviewSignature!==sig(p))p.reviewSignature='';
  },true);

  const oldRenderAll=window.renderAll;
  if(typeof oldRenderAll==='function'){
    window.renderAll=function(){const out=oldRenderAll.apply(this,arguments);if(document.getElementById('screen-parts')?.classList.contains('active'))requestAnimationFrame(()=>window.renderParts());return out;};
    try{renderAll=window.renderAll}catch(e){}
  }
  requestAnimationFrame(()=>{if(typeof window.renderParts==='function')window.renderParts()});
})();


// --- block 29 ---

(function(){
  window.showPanelSavedToast=function(ok){
    let toast=document.getElementById('panelSaveToast');
    if(!toast){toast=document.createElement('div');toast.id='panelSaveToast';toast.className='panel-save-toast';toast.innerHTML=`<span class="save-toast-icon">✓</span><span class="save-toast-text">${st('common.panelSavedToast')}</span>`;document.body.appendChild(toast)}
    toast.className='panel-save-toast '+(ok?'saved':'error');
    toast.querySelector('.save-toast-icon').textContent=ok?'✓':'!';
    toast.querySelector('.save-toast-text').textContent=ok?st('common.panelSavedNextReady'):st('common.panelCouldNotBeSaved');
    requestAnimationFrame(()=>toast.classList.add('show'));
    clearTimeout(window.__panelSaveToastTimer);
    window.__panelSaveToastTimer=setTimeout(()=>toast.classList.remove('show'),1450);
  };
  window.openProjectNotesEditor=function(){
    const p=typeof project==='function'?project():null;if(!p)return;
    const overlay=document.createElement('div');overlay.className='project-notes-overlay';
    overlay.innerHTML=`<div class="project-notes-sheet" role="dialog" aria-modal="true" aria-labelledby="projectNotesTitle"><div class="project-notes-head"><span class="notes-big-icon">📝</span><h2 id="projectNotesTitle">${st('common.projectNotesTitle')}</h2></div><p class="project-notes-help">${st('common.addMainInfoHint')}</p><textarea id="projectNotesEditor" placeholder="${st('common.accessOrderSpecialPlaceholder')}"></textarea><div class="project-notes-actions"><button type="button" class="btn" data-close-project-notes>${st('common.cancelBtn')}</button><button type="button" class="btn primary" data-save-project-notes>${st('common.saveNotesBtn')}</button></div></div>`;
    document.body.appendChild(overlay);
    const input=overlay.querySelector('#projectNotesEditor');input.value=p.notes||'';
    const close=()=>overlay.remove();overlay.addEventListener('click',e=>{if(e.target===overlay)close()});overlay.querySelector('[data-close-project-notes]').onclick=close;
    overlay.querySelector('[data-save-project-notes]').onclick=()=>{p.notes=input.value.trim();const ok=typeof save==='function'?save():true;close();if(typeof renderJobBom==='function')renderJobBom();showPanelSavedToast(ok!==false);};
    setTimeout(()=>input.focus(),40);
  };
})();


// --- block 30 ---

(function(){
  // "Save to Customer" on the Drawing screen -- a deliberate, visible way to
  // file the current drawing under a customer, rather than trusting the
  // continuous background autosave. Every job already groups onto a
  // customer's card purely by matching its customer name string (see
  // allCustomerEntries), so this just makes sure that name is actually set,
  // then confirms and jumps to that card so it's obvious where the work went.
  window.showSavedToCustomerToast=function(name){
    let toast=document.getElementById('panelSaveToast');
    if(!toast){toast=document.createElement('div');toast.id='panelSaveToast';toast.className='panel-save-toast';toast.innerHTML=`<span class="save-toast-icon">✓</span><span class="save-toast-text"></span>`;document.body.appendChild(toast)}
    toast.className='panel-save-toast saved';
    toast.querySelector('.save-toast-icon').textContent='✓';
    toast.querySelector('.save-toast-text').textContent=st('common.savedToCustomerToast',[name]);
    requestAnimationFrame(()=>toast.classList.add('show'));
    clearTimeout(window.__panelSaveToastTimer);
    window.__panelSaveToastTimer=setTimeout(()=>toast.classList.remove('show'),1450);
  };
  document.addEventListener('click',function(e){
    const btn=e.target.closest('#saveToCustomerBtn');
    if(!btn)return;
    e.preventDefault();
    const p=typeof project==='function'?project():null;
    if(!p)return;
    let name=String(p.customer||'').trim();
    if(!name){
      name=(prompt(st('drawing.enterCustomerNamePrompt'))||'').trim();
      if(!name)return;
      p.customer=name;
    }
    if(typeof save==='function')save();
    showSavedToCustomerToast(name);
    currentCustomerName=name;
    if(typeof renderCustomers==='function')renderCustomers();
    if(typeof show==='function')show('customers');
  },true);
})();
