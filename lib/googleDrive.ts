
// Fix: Declare global 'google' property on window to resolve 'Property google does not exist on type Window'
declare global {
  interface Window {
    google: any;
  }
}

const CLIENT_ID = '898672983994-bj9dcorleogjbvs41515648j6ri9addn.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';
const SAVE_FILENAME = 'pgw_savegame.json';

export interface SaveData {
  coins: number;
  inventory: any[];
  lastCheckIn: number | null;
}

export const initTokenClient = (callback: (token: string) => void) => {
  return window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response: any) => {
      if (response.access_token) {
        callback(response.access_token);
      }
    },
  });
};

export async function findSaveFile(token: string): Promise<string | null> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${SAVE_FILENAME}'`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await response.json();
  return data.files && data.files.length > 0 ? data.files[0].id : null;
}

export async function loadSaveFile(token: string, fileId: string): Promise<SaveData | null> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.ok ? await response.json() : null;
}

export async function saveToDrive(token: string, data: SaveData, existingFileId: string | null) {
  const metadata = {
    name: SAVE_FILENAME,
    parents: existingFileId ? undefined : ['appDataFolder'],
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }));

  const url = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

  const method = existingFileId ? 'PATCH' : 'POST';

  const response = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  return await response.json();
}