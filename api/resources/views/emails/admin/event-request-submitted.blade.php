@extends('emails.layout')

@section('content')
<p>A new event request has been submitted.</p>

<div class="meta">
    <strong>Event name:</strong> {{ $event_name }}<br>
    <strong>Contact person:</strong> {{ $contact_person_name }}<br>
    <strong>Phone:</strong> {{ $contact_phone }}<br>
    <strong>Venue:</strong> {{ $venue_name }}<br>
    <strong>Dates:</strong> {{ $start_date }} — {{ $end_date }}<br>
    <strong>Location:</strong> {{ $city }}{{ !empty($country) ? ', ' . $country : '' }}
</div>
@endsection
