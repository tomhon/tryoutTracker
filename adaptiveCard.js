var AdaptiveCards = require("adaptivecards");

var trackingAdaptiveCard = new AdaptiveCards.AdaptiveCard();

trackingAdaptiveCard = {


    
    // "contentType": "application/vnd.microsoft.card.adaptive",
	"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
	"type": "AdaptiveCard",
	"version": "1.0",
	"body": [
		{
			"type": "Container",
			"items": [
				{
					"type": "TextBlock",
					"text": "Tryout Tracker",
					"weight": "bolder",
					"size": "medium"
				},
				{
					"type": "ColumnSet",
					"columns": [
						{
							"type": "Column",
							"width": "auto",
							"items": [
								{
									"type": "Image",
									"url": "https://pbs.twimg.com/profile_images/3647943215/d7f12830b3c17a5a9e4afcc370e3a37e_400x400.jpeg",
									"size": "small",
									"style": "person"
								}
							]
						},
						{
							"type": "Column",
							"width": "stretch",
							"items": [
								{
									"type": "TextBlock",
									"text": "Player #7",
									"weight": "bolder",
									"wrap": true
								},
								{
									"type": "TextBlock",
									"spacing": "none",
									"text": "Tom Honeybone",
									"isSubtle": true,
									"wrap": true
								}
							]
						}
					]
				}
			]
		},
				{
			"type": "Container",
			"items": [
				{
					"type": "TextBlock",
					"text": "Terrific ball control, excellent set pieces, needs work on communicating with team mates",
					"wrap": true
				}
			]
		}

	],
	"actions": [

				{
			"type": "Action.ShowCard",
			"title": "Technical Skills 4.5",
			"card": {
				"type": "AdaptiveCard",
				"body": [
					{
						"type": "Input.Date",
						"id": "dueDate",
						"title": "Select due date"
					}
				],
				"actions": [
				    {
				        "type": "Action.Submit",
				        "title": "OK"
			        }
				]
			}
		},
				{
			"type": "Action.ShowCard",
			"title": "Game Skills 3.5",
			"card": {
				"type": "AdaptiveCard",
				"body": [
					{
						"type": "Input.Date",
						"id": "dueDate",
						"title": "Select due date"
					}
				],
				"actions": [
				    {
				        "type": "Action.Submit",
				        "title": "OK"
			        }
				]
			}
		},
		
		
		{
			"type": "Action.ShowCard",
			"title": "Athleticism 4.0",
			"card": {
				"type": "AdaptiveCard",
				"body": [
					{
						"type": "Input.Text",
						"id": "comment",
						"isMultiline": true,
						"placeholder": "Enter your comment"
					}
				],
				"actions": [
					{
						"type": "Action.Submit",
						"title": "OK"
					}
				]
			}
		},
				{
			"type": "Action.ShowCard",
			"title": "Intangibles 3.0",
			"card": {
				"type": "AdaptiveCard",
				"body": [
					{
						"type": "Input.Text",
						"id": "comment",
						"isMultiline": true,
						"placeholder": "Enter your comment"
					}
				],
				"actions": [
					{
						"type": "Action.Submit",
						"title": "OK"
					}
				]
			}
		},
		{
			"type": "Action.ShowCard",
			"title": "Add Comments ",
			"card": {
				"type": "AdaptiveCard",
				"body": [
					{
						"type": "Input.Text",
						"id": "comment",
						"isMultiline": true,
						"placeholder": "Enter your comment"
					}
				],
				"actions": [
					{
						"type": "Action.Submit",
						"title": "OK"
					}
				]
			}
		},
				{
			"type": "Action.ShowCard",
			"title": "Select Another Player",
			"card": {
				"type": "AdaptiveCard",
				"body": [
					{
						"type": "Input.Date",
						"id": "dueDate",
						"title": "Select due date"
					}
				],
				"actions": [
				    {
				        "type": "Action.Submit",
				        "title": "OK"
			        }
				]
			}
		}
	]
};

module.exports = trackingAdaptiveCard;