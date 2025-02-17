import * as vscode from 'vscode';
import { DOMParser } from 'xmldom';
import sharp = require('sharp');
import * as path from 'path';
import * as os from 'os';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('vpImageExtract.openImages', async () => {
    const expected = await vscode.window.showOpenDialog({ 
      canSelectMany: false, 
      filters: { 'XML files': [''] },
      openLabel: 'Please select VP'
    });
    if (!expected || expected.length !== 1) {
      vscode.window.showErrorMessage('Please select a VP.');
      return;
    }
    
    const image1 = await extractImage(expected[0].fsPath);
    const mask = await extractMask(expected[0].fsPath);

    if (image1) {
      const outputFilePath = await generateImageWithMask(image1, mask);
      const panel = vscode.window.createWebviewPanel(
        'imagePreview',
        'Image Preview',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.file(path.dirname(outputFilePath))]
        }
      );
      const imageUri = vscode.Uri.file(outputFilePath);
      panel.webview.html = `<img src="${panel.webview.asWebviewUri(imageUri)}" />`;
    } else {
      vscode.window.showErrorMessage('Failed to extract images from the selected file.');
    }
  });

  context.subscriptions.push(disposable);
}

async function extractImage(filePath: string): Promise<string | null> {
  const content = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
  const xml = content.toString();
  const startTag = "<Verification ";
  const endTag = "<Mask";
  const startIndex = xml.indexOf(startTag);
  const endIndex = xml.indexOf(endTag);

  if (startIndex > 0 && endIndex > 0) {
    const verificationContent = xml.substring(startIndex + startTag.length, endIndex).trim();
    const imageTagStart = verificationContent.indexOf('>');

    if (imageTagStart > 0) {
      return verificationContent.substring(imageTagStart+1).trim();
    }
  }

  return null;
}

async function extractMask(filePath: string): Promise<string | null> {
  const content = await vscode.workspace.fs.readFile(vscode.Uri.file(filePath));
  const xml = content.toString();
  const maskStartIndex = xml.indexOf('<Mask>');
  const maskEndIndex = xml.indexOf('</Mask>');

  if (maskStartIndex > 0 && maskEndIndex > 0) {
    return xml.substring(maskStartIndex + '<Mask>'.length, maskEndIndex + '</Mask>'.length).trim();
  }

  return null;
}

async function generateImageWithMask(image1: string, mask: string | null): Promise<string> {
  const imageBuffer = Buffer.from(image1, 'base64');
  let image = sharp(imageBuffer);

  if (mask) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(mask, "text/xml");
    const rect = xmlDoc.getElementsByTagName("Rect")[0];

    if (rect) {
      const x = parseInt(rect.getAttribute("x") || "0");
      const y = parseInt(rect.getAttribute("y") || "0");
      const width = parseInt(rect.getAttribute("width") || "0");
      const height = parseInt(rect.getAttribute("height") || "0");
      const type = rect.getAttribute("type");

      const overlay = sharp({
        create: {
          width: width,
          height: height,
          channels: 4,
          background: type === 'negative' ? { r: 0, g: 0, b: 0, alpha: 1 } : { r: 0, g: 0, b: 0, alpha: 0 }
        }
      }).png();

      if (type === 'positive') {
        overlay.extend({
          top: y,
          left: x,
          bottom: await image.metadata().then((meta: sharp.Metadata) => meta.height! - y - height),
          right: await image.metadata().then((meta: sharp.Metadata) => meta.width! - x - width),
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        }).composite([{ input: Buffer.from(`<svg><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="none" stroke="rgba(0,0,0,0.5)" stroke-width="2"/></svg>`), blend: 'over' }]);
      }

      image = image.composite([{ input: await overlay.toBuffer(), top: y, left: x }]);
    }
  }

  const outputFilePath = path.join(os.tmpdir(), 'output.png');
  await image.toFile(outputFilePath);

  return outputFilePath;
}

export function deactivate() {}
