import { Component, signal, NgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  message = signal('');
  private client: any;
  constructor(private zone: NgZone) {
    this.initEvents();
  }

  private async initEvents() {
    try {
      this.client = new EventsClientLib.EventsClient();
      await this.client.connect('https://vertical-notification-api-h7guhgbnh8d4c2fc.southindia-01.azurewebsites.net/eventsHub');

      // Try to register this app on the server if invoke is available.
      const startTarget = this.client?.hub ?? this.client;
      const invokeFn = startTarget?.invoke?.bind(startTarget);
      if (invokeFn) invokeFn('RegisterApp1').catch(() => {});

      // ACK handler updates UI via NgZone and signal
      if (typeof this.client.onAck === 'function') {
        this.client.onAck((ack: any) => {
          console.log('ACK', ack);
          this.zone.run(() => this.message.set(`ACK received: ${ack.status}`));
        });
      }
    } catch (err) {
      console.error('initEvents error:', err);
    }
  }
  protected readonly title = signal('Calling App UI');
 

  async makeCall(caller: string, extension: string) {
    this.message.set('Call is attempted');

    const extNum = Number(extension) || 0;
    const payload = { caller: caller || '', extension: extNum };

    try {
      const res = await fetch('https://vertical-notification-api-h7guhgbnh8d4c2fc.southindia-01.azurewebsites.net/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        this.message.set(`Call sent (requestId: ${result.requestId})`);
      } else {
        const text = await res.text().catch(() => '');
        this.message.set(`Call failed${text ? ': ' + text : ''}`);
      }
    } catch (e) {
      this.message.set('Call failed');
    }
  }
}
