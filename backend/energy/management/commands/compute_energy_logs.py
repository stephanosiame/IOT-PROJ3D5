from django.core.management.base import BaseCommand
from django.utils import timezone
from energy.models import SensorReading, EnergyLog, Streetlight
from datetime import timedelta

class Command(BaseCommand):
    help = 'Aggregate daily energy consumption from sensor readings'

    def handle(self, *args, **options):
        first_reading = SensorReading.objects.order_by('timestamp').first()
        if not first_reading:
            self.stdout.write("No sensor readings found.")
            return

        start_date = first_reading.timestamp.date()
        end_date = timezone.now().date()

        for light in Streetlight.objects.all():
            current_date = start_date
            while current_date <= end_date:
                readings = SensorReading.objects.filter(
                    streetlight=light,
                    timestamp__date=current_date
                )
                if not readings:
                    current_date += timedelta(days=1)
                    continue

                total_wh = sum(r.energy_wh for r in readings if r.energy_wh)
                if total_wh == 0 and readings.count() > 1:
                    avg_power = sum(r.power for r in readings) / readings.count()
                    hours_operating = readings.count() * 10 / 3600  # assumes 10 sec interval
                    total_wh = avg_power * hours_operating

                kWh_consumed = total_wh / 1000.0
                baseline = 5.0  # placeholder baseline (kWh per day)
                kWh_saved = max(0, baseline - kWh_consumed)
                cost_used = kWh_consumed * 0.12  # $0.12 per kWh

                EnergyLog.objects.update_or_create(
                    streetlight=light,
                    log_date=current_date,
                    defaults={
                        'kWh_consumed': kWh_consumed,
                        'kWh_saved': kWh_saved,
                        'cost_used': cost_used,
                        'baseline_kwh': baseline,
                    }
                )
                current_date += timedelta(days=1)

        self.stdout.write(f"Energy logs updated from {start_date} to {end_date}")
