@extends('emails.layout')

@section('content')
<p>A new event has been created.</p>

<div class="meta">
    <strong>Event:</strong> {{ $event_name }}<br>
    <strong>ID:</strong> {{ $event_id }}<br>
    <strong>Contact:</strong> {{ $contact_person_name }}<br>
    <strong>Phone:</strong> {{ $contact_phone }}<br>
    <strong>Venue:</strong> {{ $venue_name }}<br>
    <strong>Dates:</strong> {{ $start_date }} — {{ $end_date }}<br>
    <strong>Location:</strong> {{ $city }}, {{ $country }}
</div>
@endsection
