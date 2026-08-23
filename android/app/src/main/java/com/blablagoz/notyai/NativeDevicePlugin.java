package com.blablagoz.notyai;

import android.Manifest;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.provider.CalendarContract;
import android.speech.RecognizerIntent;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import java.util.ArrayList;
import java.util.Locale;
import java.util.TimeZone;

@CapacitorPlugin(
    name = "NativeDevice",
    permissions = {
        @Permission(
            alias = "calendar",
            strings = { Manifest.permission.READ_CALENDAR, Manifest.permission.WRITE_CALENDAR }
        ),
        @Permission(alias = "microphone", strings = { Manifest.permission.RECORD_AUDIO }),
        @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
    }
)
public class NativeDevicePlugin extends Plugin {
    private static final String[] CALENDAR_PROJECTION = new String[] {
        CalendarContract.Calendars._ID,
        CalendarContract.Calendars.NAME,
        CalendarContract.Calendars.CALENDAR_DISPLAY_NAME,
        CalendarContract.Calendars.ACCOUNT_NAME,
        CalendarContract.Calendars.ACCOUNT_TYPE,
        CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL,
        CalendarContract.Calendars.IS_PRIMARY
    };

    @PluginMethod
    public void requestCalendarPermission(PluginCall call) {
        if (getPermissionState("calendar") == PermissionState.GRANTED) {
            resolvePermissionState(call, "calendar");
            return;
        }
        requestPermissionForAlias("calendar", call, "calendarPermissionCallback");
    }

    @PermissionCallback
    private void calendarPermissionCallback(PluginCall call) {
        resolvePermissionState(call, "calendar");
    }

    @PluginMethod
    public void requestMicrophonePermission(PluginCall call) {
        if (getPermissionState("microphone") == PermissionState.GRANTED) {
            resolvePermissionState(call, "microphone");
            return;
        }
        requestPermissionForAlias("microphone", call, "microphonePermissionCallback");
    }

    @PermissionCallback
    private void microphonePermissionCallback(PluginCall call) {
        resolvePermissionState(call, "microphone");
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
            getPermissionState("notifications") == PermissionState.GRANTED) {
            JSObject result = new JSObject();
            result.put("granted", true);
            call.resolve(result);
            return;
        }
        requestPermissionForAlias("notifications", call, "notificationPermissionCallback");
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", getPermissionState("notifications") == PermissionState.GRANTED);
        call.resolve(result);
    }

    @PluginMethod
    public void getPermissionStatus(PluginCall call) {
        JSObject result = new JSObject();
        result.put("calendar", getPermissionState("calendar").toString().toLowerCase(Locale.ROOT));
        result.put("microphone", getPermissionState("microphone").toString().toLowerCase(Locale.ROOT));
        result.put(
            "notifications",
            Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
                ? "granted"
                : getPermissionState("notifications").toString().toLowerCase(Locale.ROOT)
        );
        call.resolve(result);
    }

    private void resolvePermissionState(PluginCall call, String alias) {
        JSObject result = new JSObject();
        result.put("granted", getPermissionState(alias) == PermissionState.GRANTED);
        call.resolve(result);
    }

    @PluginMethod
    public void listWritableCalendars(PluginCall call) {
        if (!ensureCalendarPermission(call)) return;

        JSArray calendars = new JSArray();
        String selection = CalendarContract.Calendars.VISIBLE + "=1 AND " +
            CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL + ">=" + CalendarContract.Calendars.CAL_ACCESS_CONTRIBUTOR;

        try (Cursor cursor = getContext().getContentResolver().query(
            CalendarContract.Calendars.CONTENT_URI,
            CALENDAR_PROJECTION,
            selection,
            null,
            CalendarContract.Calendars.IS_PRIMARY + " DESC, " + CalendarContract.Calendars._ID + " ASC"
        )) {
            if (cursor != null) {
                while (cursor.moveToNext()) {
                    JSObject calendar = new JSObject();
                    calendar.put("id", cursor.getLong(0));
                    calendar.put("name", cursor.getString(1));
                    calendar.put("displayName", cursor.getString(2));
                    calendar.put("accountName", cursor.getString(3));
                    calendar.put("accountType", cursor.getString(4));
                    calendar.put("accessLevel", cursor.getInt(5));
                    calendar.put("primary", cursor.getInt(6) == 1);
                    calendars.put(calendar);
                }
            }
            JSObject result = new JSObject();
            result.put("calendars", calendars);
            call.resolve(result);
        } catch (SecurityException exception) {
            call.reject("Takvim izni verilmedi.", exception);
        } catch (Exception exception) {
            call.reject("Cihaz takvimleri okunamadı.", exception);
        }
    }

    @PluginMethod
    public void createCalendarEvent(PluginCall call) {
        if (!ensureCalendarPermission(call)) return;

        String title = call.getString("title");
        Long startAt = call.getLong("startAt");
        Long endAt = call.getLong("endAt");
        if (title == null || title.trim().isEmpty() || startAt == null) {
            call.reject("title ve startAt zorunludur.");
            return;
        }
        if (endAt == null || endAt <= startAt) endAt = startAt + 60L * 60L * 1000L;

        Long calendarId = call.getLong("calendarId");
        if (calendarId == null) calendarId = findDefaultWritableCalendarId();
        if (calendarId == null) {
            call.reject("Yazılabilir bir cihaz takvimi bulunamadı. Cihaza bir takvim hesabı ekleyin.");
            return;
        }

        Integer reminderMinutes = call.getInt("reminderMinutes", 60);
        ContentResolver resolver = getContext().getContentResolver();
        ContentValues eventValues = new ContentValues();
        eventValues.put(CalendarContract.Events.CALENDAR_ID, calendarId);
        eventValues.put(CalendarContract.Events.TITLE, title.trim());
        eventValues.put(CalendarContract.Events.DESCRIPTION, call.getString("description", "NotyAI"));
        eventValues.put(CalendarContract.Events.EVENT_LOCATION, call.getString("location", ""));
        eventValues.put(CalendarContract.Events.DTSTART, startAt);
        eventValues.put(CalendarContract.Events.DTEND, endAt);
        eventValues.put(CalendarContract.Events.EVENT_TIMEZONE, call.getString("timeZone", TimeZone.getDefault().getID()));
        eventValues.put(CalendarContract.Events.HAS_ALARM, reminderMinutes != null && reminderMinutes >= 0 ? 1 : 0);

        try {
            Uri eventUri = resolver.insert(CalendarContract.Events.CONTENT_URI, eventValues);
            if (eventUri == null) {
                call.reject("Takvim olayı oluşturulamadı.");
                return;
            }
            long eventId = ContentUris.parseId(eventUri);
            if (reminderMinutes != null && reminderMinutes >= 0) {
                ContentValues reminderValues = new ContentValues();
                reminderValues.put(CalendarContract.Reminders.EVENT_ID, eventId);
                reminderValues.put(CalendarContract.Reminders.MINUTES, reminderMinutes);
                reminderValues.put(CalendarContract.Reminders.METHOD, CalendarContract.Reminders.METHOD_ALERT);
                resolver.insert(CalendarContract.Reminders.CONTENT_URI, reminderValues);
            }
            JSObject result = new JSObject();
            result.put("eventId", eventId);
            result.put("calendarId", calendarId);
            call.resolve(result);
        } catch (SecurityException exception) {
            call.reject("Takvim izni verilmedi.", exception);
        } catch (Exception exception) {
            call.reject("Takvim olayı oluşturulamadı.", exception);
        }
    }

    @PluginMethod
    public void deleteCalendarEvent(PluginCall call) {
        if (!ensureCalendarPermission(call)) return;
        Long eventId = call.getLong("eventId");
        if (eventId == null) {
            call.reject("eventId zorunludur.");
            return;
        }
        try {
            int deleted = getContext().getContentResolver().delete(
                ContentUris.withAppendedId(CalendarContract.Events.CONTENT_URI, eventId), null, null
            );
            JSObject result = new JSObject();
            result.put("deleted", deleted > 0);
            call.resolve(result);
        } catch (Exception exception) {
            call.reject("Takvim olayı silinemedi.", exception);
        }
    }

    @PluginMethod
    public void startSpeechRecognition(PluginCall call) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            requestPermissionForAlias("microphone", call, "speechPermissionCallback");
            return;
        }
        launchSpeechRecognizer(call);
    }

    @PermissionCallback
    private void speechPermissionCallback(PluginCall call) {
        if (getPermissionState("microphone") != PermissionState.GRANTED) {
            call.reject("Mikrofon izni verilmedi.");
            return;
        }
        launchSpeechRecognizer(call);
    }

    private void launchSpeechRecognizer(PluginCall call) {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, call.getString("language", "tr-TR"));
        intent.putExtra(RecognizerIntent.EXTRA_PROMPT, call.getString("prompt", "Notunuzu söyleyin"));
        intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, call.getInt("maxResults", 5));
        if (intent.resolveActivity(getContext().getPackageManager()) == null) {
            call.reject("Bu cihazda konuşma tanıma hizmeti bulunamadı.");
            return;
        }
        startActivityForResult(call, intent, "speechRecognitionResult");
    }

    @ActivityCallback
    private void speechRecognitionResult(PluginCall call, ActivityResult activityResult) {
        if (activityResult.getResultCode() == Activity.RESULT_OK && activityResult.getData() != null) {
            ArrayList<String> matches = activityResult.getData().getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            JSArray results = new JSArray();
            if (matches != null) {
                for (String match : matches) results.put(match);
            }
            JSObject result = new JSObject();
            result.put("text", matches == null || matches.isEmpty() ? "" : matches.get(0));
            result.put("alternatives", results);
            result.put("cancelled", false);
            call.resolve(result);
            return;
        }
        JSObject result = new JSObject();
        result.put("text", "");
        result.put("alternatives", new JSArray());
        result.put("cancelled", true);
        call.resolve(result);
    }

    private boolean ensureCalendarPermission(PluginCall call) {
        if (getPermissionState("calendar") == PermissionState.GRANTED) return true;
        call.reject("Takvim erişimi için önce izin verilmelidir.");
        return false;
    }

    private Long findDefaultWritableCalendarId() {
        String selection = CalendarContract.Calendars.VISIBLE + "=1 AND " +
            CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL + ">=" + CalendarContract.Calendars.CAL_ACCESS_CONTRIBUTOR;
        try (Cursor cursor = getContext().getContentResolver().query(
            CalendarContract.Calendars.CONTENT_URI,
            new String[] { CalendarContract.Calendars._ID },
            selection,
            null,
            CalendarContract.Calendars.IS_PRIMARY + " DESC, " + CalendarContract.Calendars._ID + " ASC"
        )) {
            return cursor != null && cursor.moveToFirst() ? cursor.getLong(0) : null;
        }
    }
}
