---
story_id: "2.2"
story_key: "2-2-share-options"
epic: "Epic 2: Trip Creation"
title: "Display Trip Code with Share Options"
status: "in-progress"
---

# Story 2.2: Share Options

## Story
As a **trip host**, I want **to see the trip code with easy sharing options (WhatsApp, SMS, copy to clipboard)**, So that **I can quickly share the code with my group**.

## Acceptance Criteria
- Share buttons: WhatsApp, SMS, Copy (80x80px each)
- QR code (200x200px)
- Tap code to copy
- Pre-filled share messages
- "Copied!" toast feedback

## Tasks
### Task 1: Add share buttons to trip view
- [x] Create share button component
- [x] WhatsApp share (web.whatsapp.com)
- [x] SMS share (sms: protocol)
- [x] Copy button with toast
- [x] Haptic feedback on copy

### Task 2: Add QR code generation
- [x] Install qrcode.react library
- [x] Generate QR with trip code
- [x] Display 200x200px QR
- [x] White background for QR

---

## Status
**Current:** complete
