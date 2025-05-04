"use client"

import type React from "react"
import Chat from "@/components/Chat";
import { useState, useEffect, useRef } from "react"
import {
  ChefHat,
  Send,
  Utensils,
  Home,
  Book,
  Coffee,
  Pizza,
  Cake,
  Salad,
  Soup,
  Drumstick,
  Fish,
  Apple,
  Sandwich,
  ArrowLeft,
  Clock,
  Users,
  Mic,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useElevenLabsConvai } from "./hooks/useElevenLabsConvai"


// Define types
type Category = {
  icon: React.ElementType
  label: string
  id: string
}

type Recipe = {
  id: string
  title: string
  cookTime: string
  servings: string
  difficulty: "Easy" | "Medium" | "Hard"
  imageUrl: string
  ingredients: string[]
  instructions: string[]
}

type ViewState = "home" | "category" | "chat"

export default function CookingChatbot() {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Hello! I'm your cooking assistant. Ask me anything about recipes, cooking techniques, or meal planning!",
    },
  ])
  const [input, setInput] = useState("")
  const [viewState, setViewState] = useState<ViewState>("home")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Use Eleven Labs Convai hook
  const { sendToElevenLabs } = useElevenLabsConvai({
    onMessage: (message) => {
      // Add Eleven Labs responses to our chat
      setMessages((prev) => [...prev, { role: "bot", content: message }])
    },
    selectedRecipe,
    embedSelector: "#voice-widget-container" // Add this to embed the widget in our chat
  })

  // Effect to scroll to bottom of chat when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: input }])

    // Send to Eleven Labs Convai if available
    sendToElevenLabs(input)

    // Simulate bot response only if not using Eleven Labs voice mode
    if (!isVoiceMode) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content:
              "I'd be happy to help with that! What specific ingredients do you have or what type of dish are you looking to make?",
          },
        ])
      }, 1000)
    }

    setInput("")
  }

  const toggleVoiceMode = () => {
    // If turning on voice mode
    if (!isVoiceMode) {
      setIsVoiceMode(true)
      
      // Show voice mode activated message
      setMessages(prev => [
        ...prev, 
        { 
          role: "bot", 
          content: "Voice mode activated with Eleven Labs. You can speak with the assistant directly!" 
        }
      ]);

      // Give a moment for the container to render before initializing
      setTimeout(() => {
        // Send initial message to Eleven Labs to establish context
        sendToElevenLabs("Hello, I'd like to talk about cooking.")
      }, 300);
    } else {
      // Turn off voice mode
      setIsVoiceMode(false)
      setMessages(prev => [
        ...prev, 
        { 
          role: "bot", 
          content: "Voice mode deactivated. You can type your messages now." 
        }
      ]);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const goToHome = () => {
    setViewState("home")
    setSelectedCategory(null)
    setSelectedRecipe(null)
  }

  const goToChat = () => {
    setViewState("chat")
  }

  const selectCategory = (category: Category) => {
    setSelectedCategory(category)
    setViewState("category")
  }

  const selectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
    setViewState("chat")

    // Clear previous messages and add recipe instructions
    setMessages([
      {
        role: "bot",
        content: `I'd be happy to help you make ${recipe.title}! Here's what you'll need:`,
      },
      {
        role: "bot",
        content: `**Ingredients:**\n${recipe.ingredients.map((ingredient) => `• ${ingredient}`).join("\n")}`,
      },
      {
        role: "bot",
        content: `**Instructions:**\n${recipe.instructions.map((step, index) => `${index + 1}. ${step}`).join("\n\n")}`,
      },
      {
        role: "bot",
        content: "Do you have any questions about this recipe? I'm here to help!",
      },
    ])
  }

  const categories: Category[] = [
    { icon: Pizza, label: "Pizza Recipes", id: "pizza" },
    { icon: Cake, label: "Desserts", id: "desserts" },
    { icon: Salad, label: "Salads", id: "salads" },
    { icon: Soup, label: "Soups", id: "soups" },
    { icon: Coffee, label: "Beverages", id: "beverages" },
    { icon: Drumstick, label: "Meat Dishes", id: "meat" },
    { icon: Fish, label: "Seafood", id: "seafood" },
    { icon: Apple, label: "Vegetarian", id: "vegetarian" },
    { icon: Sandwich, label: "Quick Meals", id: "quick" },
    { icon: Book, label: "All Recipes", id: "all" },
  ]

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-amber-50 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm p-4">
        <div className="container max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-full">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-orange-800">QuickRecepie</h1>
          </div>
          <Button
            variant="ghost"
            size="lg"
            className="rounded-full hover:bg-orange-100 h-10 w-10 p-0"
            onClick={goToHome}
          >
            <Home className="h-6 w-6 text-orange-600" />
          </Button>
        </div>
      </header>

      {/* Content Container */}
      <div className="container max-w-4xl mx-auto flex-1 flex flex-col p-4">
        {viewState === "home" && (
          <HomeScreen categories={categories} onCategoryClick={selectCategory} onChatClick={goToChat} />
        )}
        {viewState === "category" && selectedCategory && (
          <CategoryScreen
            category={selectedCategory}
            onBackClick={goToHome}
            onChatClick={goToChat}
            onRecipeClick={selectRecipe}
          />
        )}
        {viewState === "chat" && (
          <ChatScreen
            messages={messages}
            input={input}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
            handleKeyDown={handleKeyDown}
            scrollAreaRef={scrollAreaRef as React.RefObject<HTMLDivElement>}
            isVoiceMode={isVoiceMode}
            toggleVoiceMode={toggleVoiceMode}
          />
        )}
      </div>
    </main>
  )
}

interface HomeScreenProps {
  categories: Category[]
  onCategoryClick: (category: Category) => void
  onChatClick: () => void
}

function HomeScreen({ categories, onCategoryClick, onChatClick }: HomeScreenProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-orange-800 mb-2">Recipe Categories</h2>
        <p className="text-orange-700">Explore recipes or ask QuickRecepie for cooking advice</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category, index) => {
          const Icon = category.icon
          return (
            <Card
              key={index}
              className="flex flex-col items-center justify-center p-4 hover:bg-orange-50 transition-colors cursor-pointer border-orange-200"
              onClick={() => onCategoryClick(category)}
            >
              <div className="bg-orange-100 p-3 rounded-full mb-3">
                <Icon className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-orange-800">{category.label}</span>
            </Card>
          )
        })}
      </div>

      <Button className="mt-4 bg-orange-500 hover:bg-orange-600 text-white" onClick={onChatClick}>
        Ask QuickRecepie
      </Button>
    </div>
  )
}

interface CategoryScreenProps {
  category: Category
  onBackClick: () => void
  onChatClick: () => void
  onRecipeClick: (recipe: Recipe) => void
}

function CategoryScreen({ category, onBackClick, onChatClick, onRecipeClick }: CategoryScreenProps) {
  // Generate 10 recipe options for the selected category
  const recipes = generateRecipesForCategory(category.id)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBackClick} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold text-orange-800">{category.label}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={onChatClick} className="text-orange-600 border-orange-200">
          Ask for Help
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} onClick={() => onRecipeClick(recipe)} />
        ))}
      </div>
    </div>
  )
}

interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
}

function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  return (
    <Card
      className="overflow-hidden border-orange-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-video bg-orange-100 relative">
        <img src={recipe.imageUrl || "/placeholder.svg"} alt={recipe.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="font-medium text-orange-800 mb-2">{recipe.title}</h3>
        <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{recipe.cookTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{recipe.servings}</span>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`
            ${recipe.difficulty === "Easy" ? "border-green-500 text-green-700" : ""}
            ${recipe.difficulty === "Medium" ? "border-orange-500 text-orange-700" : ""}
            ${recipe.difficulty === "Hard" ? "border-red-500 text-red-700" : ""}
          `}
        >
          {recipe.difficulty}
        </Badge>
      </div>
    </Card>
  )
}

interface ChatScreenProps {
  messages: { role: string; content: string }[]
  input: string
  setInput: (value: string) => void
  handleSendMessage: () => void
  handleKeyDown: (e: React.KeyboardEvent) => void
  scrollAreaRef: React.RefObject<HTMLDivElement>
  isVoiceMode: boolean
  toggleVoiceMode: () => void
}

function ChatScreen({ 
  messages, 
  input, 
  setInput, 
  handleSendMessage, 
  handleKeyDown, 
  scrollAreaRef,
  isVoiceMode,
  toggleVoiceMode
}: ChatScreenProps) {
  return (
    <>
      {/* Decorative Elements */}
      <div className="flex justify-between mb-6">
        <img
          src="/placeholder.svg?height=80&width=80"
          alt=""
          className="h-20 w-20 object-contain opacity-30"
          aria-hidden="true"
        />
        <img
          src="/placeholder.svg?height=80&width=80"
          alt=""
          className="h-20 w-20 object-contain opacity-30"
          aria-hidden="true"
        />
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 mb-4 bg-white rounded-xl shadow-md p-4" ref={scrollAreaRef as React.RefObject<HTMLDivElement>}>
        <div className="flex flex-col gap-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="flex gap-3 max-w-[80%]">
                {message.role === "bot" && (
                  <Avatar className="h-8 w-8 bg-orange-100 border border-orange-200">
                    <Utensils className="h-4 w-4 text-orange-600" />
                  </Avatar>
                )}
                <div
                  className={`p-3 rounded-xl ${
                    message.role === "user"
                      ? "bg-orange-500 text-white rounded-tr-none"
                      : "bg-orange-100 text-gray-800 rounded-tl-none"
                  }`}
                >
                  <div className="text-sm whitespace-pre-line">{message.content}</div>
                </div>
                {message.role === "user" && (
                  <Avatar className="h-8 w-8 bg-orange-500">
                    <span className="text-xs font-medium text-white">You</span>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Voice Assistant Container - only visible when voice mode is active */}
      {isVoiceMode && (
        <div 
          id="voice-widget-container" 
          className="mb-4 h-80 bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ease-in-out"
        />
      )}

      {/* Input Area */}
      <div className="relative">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isVoiceMode ? "Eleven Labs voice assistant is active..." : "Ask about a recipe or cooking technique..."}
          className="pr-24 py-6 bg-white border-orange-200 focus-visible:ring-orange-500"
          disabled={isVoiceMode}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-2">
          <Button
            onClick={toggleVoiceMode}
            size="icon"
            className={`${
              isVoiceMode 
                ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            title={isVoiceMode ? "Turn off Eleven Labs voice assistant" : "Turn on Eleven Labs voice assistant"}
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSendMessage}
            size="icon"
            className="bg-orange-500 hover:bg-orange-600"
            disabled={isVoiceMode}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-orange-700 mt-4">
        Powered by QuickRecepie • {isVoiceMode ? "Eleven Labs voice assistant is active" : "Ask me anything about cooking!"}
      </p>
    </>
  )
}

// Helper function to generate recipes for a category
function generateRecipesForCategory(categoryId: string): Recipe[] {
  const recipesByCategory: Record<string, Recipe[]> = {
    pizza: [
      {
        id: "pizza-1",
        title: "Classic Margherita Pizza",
        cookTime: "30 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pizza dough ball",
          "1/2 cup tomato sauce",
          "8 oz fresh mozzarella, sliced",
          "Fresh basil leaves",
          "2 tbsp olive oil",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Preheat your oven to 475°F (245°C) with a pizza stone or baking sheet inside.",
          "Roll out the pizza dough on a floured surface to your desired thickness.",
          "Spread the tomato sauce evenly over the dough, leaving a small border for the crust.",
          "Arrange the mozzarella slices evenly over the sauce.",
          "Drizzle with olive oil and season with salt and pepper.",
          "Carefully transfer the pizza to the preheated stone or baking sheet.",
          "Bake for 10-12 minutes until the crust is golden and the cheese is bubbly.",
          "Remove from the oven and immediately top with fresh basil leaves.",
          "Let cool for a minute before slicing and serving.",
        ],
      },
      {
        id: "pizza-2",
        title: "Pepperoni Deep Dish",
        cookTime: "45 mins",
        servings: "6 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 pizza dough balls",
          "1 cup tomato sauce",
          "2 cups mozzarella cheese, shredded",
          "1 cup pepperoni slices",
          "1/4 cup parmesan cheese, grated",
          "2 tbsp olive oil",
          "1 tsp dried oregano",
          "1 tsp garlic powder",
        ],
        instructions: [
          "Preheat your oven to 425°F (220°C).",
          "Oil a deep dish pizza pan or cast iron skillet with olive oil.",
          "Press the pizza dough into the pan, pushing it up the sides to form a crust.",
          "Layer half of the mozzarella on the bottom of the crust.",
          "Arrange the pepperoni slices over the cheese.",
          "Pour the tomato sauce over the pepperoni layer.",
          "Top with remaining mozzarella and sprinkle with parmesan cheese.",
          "Sprinkle with dried oregano and garlic powder.",
          "Bake for 30-35 minutes until the crust is golden and the cheese is bubbly and browned.",
          "Let cool for 5-10 minutes before slicing to allow the layers to set.",
        ],
      },
      {
        id: "pizza-3",
        title: "Veggie Supreme Thin Crust",
        cookTime: "25 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 thin pizza crust",
          "1/2 cup tomato sauce",
          "1 1/2 cups mozzarella cheese, shredded",
          "1/2 bell pepper, sliced",
          "1/2 red onion, thinly sliced",
          "1 cup mushrooms, sliced",
          "1/4 cup black olives, sliced",
          "1 tbsp olive oil",
          "1 tsp Italian seasoning",
        ],
        instructions: [
          "Preheat your oven to 450°F (230°C).",
          "Place the thin crust on a baking sheet or pizza stone.",
          "Spread the tomato sauce evenly over the crust.",
          "Sprinkle half of the cheese over the sauce.",
          "Arrange the vegetables (bell pepper, onion, mushrooms, and olives) evenly over the cheese.",
          "Top with the remaining cheese.",
          "Drizzle with olive oil and sprinkle with Italian seasoning.",
          "Bake for 12-15 minutes until the crust is crisp and the cheese is melted and slightly browned.",
          "Let cool for a minute before slicing and serving.",
        ],
      },
      {
        id: "pizza-4",
        title: "BBQ Chicken Pizza",
        cookTime: "35 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pizza dough ball",
          "1/2 cup BBQ sauce",
          "1 1/2 cups mozzarella cheese, shredded",
          "1 cup cooked chicken, shredded",
          "1/2 red onion, thinly sliced",
          "1/4 cup cilantro, chopped",
          "1/4 cup cheddar cheese, shredded",
        ],
        instructions: [
          "Preheat your oven to 450°F (230°C) with a pizza stone or baking sheet inside.",
          "Roll out the pizza dough on a floured surface to your desired thickness.",
          "Spread the BBQ sauce evenly over the dough, leaving a small border for the crust.",
          "Sprinkle most of the mozzarella cheese over the sauce.",
          "Distribute the shredded chicken evenly over the cheese.",
          "Add the red onion slices.",
          "Top with the remaining mozzarella and the cheddar cheese.",
          "Bake for 12-15 minutes until the crust is golden and the cheese is bubbly.",
          "Remove from the oven and sprinkle with fresh cilantro before serving.",
        ],
      },
      {
        id: "pizza-5",
        title: "Four Cheese White Pizza",
        cookTime: "30 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pizza dough ball",
          "2 tbsp olive oil",
          "2 cloves garlic, minced",
          "1 cup mozzarella cheese, shredded",
          "1/2 cup ricotta cheese",
          "1/4 cup parmesan cheese, grated",
          "1/4 cup gorgonzola cheese, crumbled",
          "1 tsp dried oregano",
          "Fresh basil leaves",
          "Black pepper to taste",
        ],
        instructions: [
          "Preheat your oven to 475°F (245°C) with a pizza stone or baking sheet inside.",
          "Roll out the pizza dough on a floured surface to your desired thickness.",
          "Mix the olive oil with minced garlic and brush over the dough.",
          "Dollop small spoonfuls of ricotta cheese evenly over the dough.",
          "Sprinkle the mozzarella, parmesan, and gorgonzola cheeses over the top.",
          "Season with dried oregano and black pepper.",
          "Bake for 10-12 minutes until the crust is golden and the cheese is melted and bubbly.",
          "Remove from the oven and top with fresh basil leaves before serving.",
        ],
      },
      {
        id: "pizza-6",
        title: "Hawaiian Pizza",
        cookTime: "30 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pizza dough ball",
          "1/2 cup tomato sauce",
          "1 1/2 cups mozzarella cheese, shredded",
          "1 cup ham, diced",
          "1 cup pineapple chunks, drained",
          "1 tbsp olive oil",
          "1 tsp dried oregano",
        ],
        instructions: [
          "Preheat your oven to 450°F (230°C) with a pizza stone or baking sheet inside.",
          "Roll out the pizza dough on a floured surface to your desired thickness.",
          "Spread the tomato sauce evenly over the dough, leaving a small border for the crust.",
          "Sprinkle half of the mozzarella cheese over the sauce.",
          "Distribute the ham and pineapple evenly over the cheese.",
          "Top with the remaining mozzarella cheese.",
          "Drizzle with olive oil and sprinkle with dried oregano.",
          "Bake for 12-15 minutes until the crust is golden and the cheese is bubbly.",
          "Let cool for a minute before slicing and serving.",
        ],
      },
      {
        id: "pizza-7",
        title: "Buffalo Chicken Pizza",
        cookTime: "35 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pizza dough ball",
          "1/3 cup buffalo sauce",
          "1/3 cup ranch dressing",
          "2 cups cooked chicken, shredded",
          "1 1/2 cups mozzarella cheese, shredded",
          "1/2 cup blue cheese, crumbled",
          "1/2 red onion, thinly sliced",
          "2 tbsp fresh parsley, chopped",
        ],
        instructions: [
          "Preheat your oven to 450°F (230°C).",
          "Roll out the pizza dough on a floured surface to your desired thickness.",
          "In a bowl, toss the shredded chicken with the buffalo sauce until well coated.",
          "Spread the ranch dressing over the pizza dough, leaving a small border for the crust.",
          "Sprinkle half of the mozzarella cheese over the ranch dressing.",
          "Distribute the buffalo chicken evenly over the cheese.",
          "Add the red onion slices.",
          "Top with the remaining mozzarella and the blue cheese crumbles.",
          "Bake for 12-15 minutes until the crust is golden and the cheese is bubbly.",
          "Remove from the oven and sprinkle with fresh parsley before serving.",
        ],
      },
      {
        id: "pizza-8",
        title: "Mushroom Truffle Pizza",
        cookTime: "40 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pizza dough ball",
          "2 tbsp olive oil",
          "2 tbsp truffle oil, divided",
          "2 cups mixed mushrooms (cremini, shiitake, oyster), sliced",
          "2 cloves garlic, minced",
          "1 1/2 cups mozzarella cheese, shredded",
          "1/4 cup parmesan cheese, grated",
          "Fresh thyme leaves",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Preheat your oven to 475°F (245°C) with a pizza stone or baking sheet inside.",
          "In a skillet, heat the olive oil over medium heat. Add the mushrooms and garlic, and sauté until the mushrooms are golden, about 5-7 minutes. Season with salt and pepper.",
          "Roll out the pizza dough on a floured surface to your desired thickness.",
          "Brush the dough with 1 tablespoon of truffle oil.",
          "Sprinkle the mozzarella cheese over the dough.",
          "Distribute the sautéed mushrooms evenly over the cheese.",
          "Sprinkle with parmesan cheese and fresh thyme leaves.",
          "Bake for 10-12 minutes until the crust is golden and the cheese is bubbly.",
          "Remove from the oven and drizzle with the remaining tablespoon of truffle oil before serving.",
        ],
      },
      {
        id: "pizza-9",
        title: "Breakfast Pizza",
        cookTime: "25 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pizza dough ball",
          "2 tbsp olive oil",
          "1 cup cheddar cheese, shredded",
          "1/2 cup mozzarella cheese, shredded",
          "4 eggs",
          "6 strips bacon, cooked and crumbled",
          "1/4 cup green onions, chopped",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Preheat your oven to 450°F (230°C) with a pizza stone or baking sheet inside.",
          "Roll out the pizza dough on a floured surface to your desired thickness.",
          "Brush the dough with olive oil.",
          "Sprinkle the cheddar and mozzarella cheeses over the dough, leaving four small wells for the eggs.",
          "Carefully crack an egg into each well.",
          "Sprinkle the crumbled bacon around the eggs.",
          "Season with salt and pepper.",
          "Bake for 10-12 minutes until the crust is golden, the cheese is bubbly, and the eggs are set but the yolks are still runny.",
          "Remove from the oven and sprinkle with green onions before serving.",
        ],
      },
      {
        id: "pizza-10",
        title: "Neapolitan Pizza",
        cookTime: "20 mins",
        servings: "2 servings",
        difficulty: "Hard",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 Neapolitan pizza dough ball (high hydration)",
          "1/4 cup San Marzano tomato sauce",
          "4 oz fresh buffalo mozzarella, torn into pieces",
          "Fresh basil leaves",
          "1 tbsp extra virgin olive oil",
          "Sea salt to taste",
        ],
        instructions: [
          "Preheat your oven to the highest temperature (ideally 500-550°F/260-290°C) with a pizza stone or steel inside for at least 1 hour.",
          "On a floured surface, gently stretch the dough by hand to about 10-12 inches in diameter, keeping the edges slightly thicker.",
          "Transfer the dough to a floured pizza peel or the back of a baking sheet.",
          "Spread the tomato sauce in a thin layer over the dough, leaving a border for the crust.",
          "Place torn pieces of buffalo mozzarella evenly over the sauce.",
          "Slide the pizza onto the preheated stone or steel in the oven.",
          "Bake for 4-6 minutes until the crust is puffed and charred in spots, and the cheese is melted.",
          "Remove from the oven and immediately top with fresh basil leaves.",
          "Drizzle with olive oil and sprinkle with sea salt before serving.",
          "For authentic Neapolitan pizza, the center should be soft and slightly wet, while the crust is puffy and charred.",
        ],
      },
    ],
    desserts: [
      {
        id: "dessert-1",
        title: "Chocolate Lava Cake",
        cookTime: "20 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "4 oz semi-sweet chocolate",
          "1/2 cup unsalted butter",
          "1 cup powdered sugar",
          "2 whole eggs",
          "2 egg yolks",
          "1/2 cup all-purpose flour",
          "1 tsp vanilla extract",
          "Pinch of salt",
          "Powdered sugar for dusting",
        ],
        instructions: [
          "Preheat oven to 425°F (220°C). Butter and lightly flour four 6-ounce ramekins.",
          "Place on a baking sheet and set aside.",
          "In a microwave-safe bowl, combine chocolate and butter. Microwave in 30-second intervals, stirring between each, until melted and smooth.",
          "Stir in powdered sugar until well blended.",
          "Whisk in eggs and egg yolks, then add vanilla extract.",
          "Stir in flour and salt until just combined.",
          "Divide the batter evenly among the prepared ramekins.",
          "Bake for 12-14 minutes until the sides are firm but the center is still soft.",
          "Let stand for 1 minute, then run a knife around the edges and invert onto dessert plates.",
          "Dust with powdered sugar and serve immediately, while the centers are still warm and molten.",
        ],
      },
      {
        id: "dessert-2",
        title: "Vanilla Bean Cheesecake",
        cookTime: "1 hour",
        servings: "8 servings",
        difficulty: "Hard",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 1/2 cups graham cracker crumbs",
          "1/3 cup melted butter",
          "1/4 cup granulated sugar",
          "4 (8 oz) packages cream cheese, softened",
          "1 1/4 cups granulated sugar",
          "1/2 cup sour cream",
          "2 tsp vanilla extract",
          "1 vanilla bean, seeds scraped",
          "4 large eggs",
          "Fresh berries for topping",
        ],
        instructions: [
          "Preheat oven to 325°F (165°C). Grease a 9-inch springform pan.",
          "In a medium bowl, mix graham cracker crumbs, melted butter, and 1/4 cup sugar. Press onto the bottom of the springform pan.",
          "Bake the crust for 10 minutes, then remove and let cool.",
          "In a large bowl, beat cream cheese and 1 1/4 cups sugar until smooth.",
          "Blend in sour cream, vanilla extract, and vanilla bean seeds.",
          "Beat in eggs one at a time, mixing just enough to incorporate.",
          "Pour filling over the prepared crust.",
          "Place the springform pan in a large roasting pan and add hot water to the roasting pan to create a water bath that comes about halfway up the sides of the springform pan.",
          "Bake for 55-60 minutes until the center is almost set but still slightly jiggly.",
          "Turn off the oven, crack the door open, and let the cheesecake cool in the oven for 1 hour.",
          "Remove from oven, run a knife around the edge, and refrigerate for at least 4 hours or overnight.",
          "Top with fresh berries before serving.",
        ],
      },
      {
        id: "dessert-3",
        title: "Apple Crumble",
        cookTime: "45 mins",
        servings: "6 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "6 large apples, peeled, cored, and sliced",
          "2 tbsp lemon juice",
          "1/2 cup granulated sugar",
          "1 tsp ground cinnamon",
          "1/4 tsp ground nutmeg",
          "1 cup all-purpose flour",
          "3/4 cup rolled oats",
          "3/4 cup brown sugar, packed",
          "1/2 cup cold unsalted butter, cubed",
          "Pinch of salt",
          "Vanilla ice cream for serving (optional)",
        ],
        instructions: [
          "Preheat oven to 375°F (190°C).",
          "In a large bowl, toss apple slices with lemon juice, granulated sugar, cinnamon, and nutmeg.",
          "Transfer the apple mixture to a 9x13 inch baking dish.",
          "In another bowl, combine flour, oats, brown sugar, and salt.",
          "Cut in the cold butter using a pastry cutter or your fingers until the mixture resembles coarse crumbs.",
          "Sprinkle the crumb topping evenly over the apples.",
          "Bake for 35-40 minutes until the topping is golden brown and the apples are tender.",
          "Let cool for 10 minutes before serving.",
          "Serve warm with a scoop of vanilla ice cream if desired.",
        ],
      },
      {
        id: "dessert-4",
        title: "Tiramisu",
        cookTime: "30 mins",
        servings: "8 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "6 egg yolks",
          "3/4 cup white sugar",
          "2/3 cup milk",
          "1 1/4 cups heavy cream",
          "1/2 tsp vanilla extract",
          "1 pound mascarpone cheese, at room temperature",
          "1/4 cup strong brewed coffee, cooled",
          "2 tbsp rum",
          "24 ladyfingers",
          "1 tbsp unsweetened cocoa powder",
          "1 oz dark chocolate, grated",
        ],
        instructions: [
          "In a medium saucepan, whisk together egg yolks and sugar until well blended.",
          "Whisk in milk and cook over medium heat, stirring constantly, until mixture boils.",
          "Boil gently for 1 minute, then remove from heat and allow to cool slightly.",
          "Cover tightly and chill in refrigerator for 1 hour.",
          "In a medium bowl, beat cream with vanilla until stiff peaks form.",
          "Whisk mascarpone into the yolk mixture until smooth.",
          "Combine coffee and rum in a small bowl.",
          "Split the ladyfingers in half lengthwise and drizzle with the coffee mixture.",
          "Arrange half of the soaked ladyfingers in the bottom of a 7x11 inch dish.",
          "Spread half of the mascarpone mixture over the ladyfingers, then half of the whipped cream over that.",
          "Repeat layers with remaining ladyfingers, mascarpone mixture, and whipped cream.",
          "Dust with cocoa powder and sprinkle with grated chocolate.",
          "Cover and refrigerate for at least 4 hours, preferably overnight, before serving.",
        ],
      },
      {
        id: "dessert-5",
        title: "Strawberry Shortcake",
        cookTime: "40 mins",
        servings: "6 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 cups all-purpose flour",
          "1/4 cup granulated sugar",
          "1 tbsp baking powder",
          "1/2 tsp salt",
          "1/2 cup cold unsalted butter, cubed",
          "2/3 cup cold heavy cream",
          "1 large egg",
          "1 tsp vanilla extract",
          "2 pounds fresh strawberries, hulled and sliced",
          "1/4 cup granulated sugar",
          "2 cups whipped cream",
          "Fresh mint leaves for garnish (optional)",
        ],
        instructions: [
          "Preheat oven to 400°F (200°C). Line a baking sheet with parchment paper.",
          "In a large bowl, whisk together flour, sugar, baking powder, and salt.",
          "Cut in the cold butter using a pastry cutter until the mixture resembles coarse crumbs.",
          "In a small bowl, whisk together heavy cream, egg, and vanilla.",
          "Add the cream mixture to the flour mixture and stir just until combined.",
          "Turn dough out onto a floured surface and gently knead a few times.",
          "Pat the dough into a 3/4-inch thick circle and cut into 6 biscuits using a round cutter.",
          "Place biscuits on the prepared baking sheet and brush tops with a little heavy cream.",
          "Bake for 15-18 minutes until golden brown. Cool on a wire rack.",
          "Meanwhile, mix sliced strawberries with sugar and let sit for at least 30 minutes.",
          "To serve, split each biscuit in half horizontally.",
          "Place the bottom half on a plate, top with a generous portion of strawberries and their juice, add a dollop of whipped cream, then place the top half of the biscuit on top.",
          "Add more strawberries and whipped cream on top, and garnish with mint if desired.",
        ],
      },
      {
        id: "dessert-6",
        title: "Chocolate Chip Cookies",
        cookTime: "15 mins",
        servings: "24 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 1/4 cups all-purpose flour",
          "1 tsp baking soda",
          "1 tsp salt",
          "1 cup unsalted butter, softened",
          "3/4 cup granulated sugar",
          "3/4 cup packed brown sugar",
          "2 large eggs",
          "2 tsp vanilla extract",
          "2 cups semi-sweet chocolate chips",
          "1 cup chopped nuts (optional)",
        ],
        instructions: [
          "Preheat oven to 375°F (190°C).",
          "In a small bowl, whisk together flour, baking soda, and salt.",
          "In a large bowl, beat butter, granulated sugar, and brown sugar until creamy.",
          "Beat in eggs one at a time, then stir in vanilla.",
          "Gradually blend in the flour mixture.",
          "Stir in chocolate chips and nuts if using.",
          "Drop by rounded tablespoons onto ungreased baking sheets.",
          "Bake for 9-11 minutes or until golden brown.",
          "Cool on baking sheets for 2 minutes, then remove to wire racks to cool completely.",
        ],
      },
      {
        id: "dessert-7",
        title: "Crème Brûlée",
        cookTime: "1 hour",
        servings: "4 servings",
        difficulty: "Hard",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 cups heavy cream",
          "1 vanilla bean, split lengthwise",
          "5 large egg yolks",
          "1/2 cup granulated sugar, plus more for topping",
          "Pinch of salt",
          "Hot water for water bath",
          "Fresh berries for garnish (optional)",
        ],
        instructions: [
          "Preheat oven to 325°F (165°C).",
          "In a saucepan, heat cream and vanilla bean over medium heat until it just begins to simmer. Remove from heat and let steep for 10 minutes.",
          "Remove the vanilla bean, scrape the seeds into the cream, and discard the pod.",
          "In a bowl, whisk together egg yolks, sugar, and salt until light and creamy.",
          "Slowly whisk the warm cream into the egg mixture, being careful not to cook the eggs.",
          "Strain the mixture through a fine sieve into a large measuring cup.",
          "Place four 6-ounce ramekins in a large baking dish.",
          "Divide the custard evenly among the ramekins.",
          "Fill the baking dish with hot water to come halfway up the sides of the ramekins.",
          "Bake for 35-40 minutes until the custards are set but still slightly jiggly in the center.",
          "Remove from the water bath and let cool to room temperature.",
          "Refrigerate for at least 2 hours or up to 3 days.",
          "Before serving, sprinkle a thin layer of sugar on top of each custard.",
          "Use a kitchen torch to caramelize the sugar until it forms a hard, golden crust.",
          "Let sit for 1 minute to harden, then serve immediately, garnished with fresh berries if desired.",
        ],
      },
      {
        id: "dessert-8",
        title: "Banana Bread",
        cookTime: "50 mins",
        servings: "10 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "3 ripe bananas, mashed",
          "1/3 cup melted butter",
          "3/4 cup granulated sugar",
          "1 large egg, beaten",
          "1 tsp vanilla extract",
          "1 tsp baking soda",
          "Pinch of salt",
          "1 1/2 cups all-purpose flour",
          "1/2 cup chopped walnuts or chocolate chips (optional)",
        ],
        instructions: [
          "Preheat oven to 350°F (175°C). Grease a 4x8 inch loaf pan.",
          "In a large bowl, mix the mashed bananas and melted butter.",
          "Mix in the sugar, egg, and vanilla.",
          "Sprinkle the baking soda and salt over the mixture and stir in.",
          "Add the flour and mix just until combined.",
          "Fold in walnuts or chocolate chips if using.",
          "Pour the batter into the prepared loaf pan.",
          "Bake for 50-60 minutes, or until a toothpick inserted into the center comes out clean.",
          "Let cool in the pan for 10 minutes, then remove to a wire rack to cool completely before slicing.",
        ],
      },
      {
        id: "dessert-9",
        title: "Lemon Bars",
        cookTime: "45 mins",
        servings: "16 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "For the crust:",
          "1 cup unsalted butter, softened",
          "1/2 cup granulated sugar",
          "2 cups all-purpose flour",
          "1/4 tsp salt",
          "For the filling:",
          "4 large eggs",
          "1 1/2 cups granulated sugar",
          "1/4 cup all-purpose flour",
          "2/3 cup fresh lemon juice",
          "1 tbsp lemon zest",
          "Powdered sugar for dusting",
        ],
        instructions: [
          "Preheat oven to 350°F (175°C). Line a 9x13 inch baking pan with parchment paper.",
          "For the crust: In a large bowl, cream together butter and sugar until light and fluffy.",
          "Mix in flour and salt until just combined.",
          "Press the dough evenly into the bottom of the prepared pan.",
          "Bake for 15-20 minutes until lightly golden.",
          "While the crust is baking, prepare the filling: In a medium bowl, whisk together eggs and sugar until well combined.",
          "Add flour and whisk until smooth.",
          "Stir in lemon juice and zest.",
          "Pour the filling over the hot crust when it comes out of the oven.",
          "Return to the oven and bake for an additional 20-25 minutes until the filling is set.",
          "Let cool completely in the pan on a wire rack.",
          "Once cool, dust with powdered sugar, cut into bars, and serve.",
        ],
      },
      {
        id: "dessert-10",
        title: "Chocolate Mousse",
        cookTime: "20 mins",
        servings: "6 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "8 oz semi-sweet chocolate, chopped",
          "3 tbsp unsalted butter",
          "3 large eggs, separated",
          "1/4 cup granulated sugar",
          "1 cup heavy cream",
          "1 tsp vanilla extract",
          "Pinch of salt",
          "Chocolate shavings for garnish",
          "Whipped cream for serving (optional)",
        ],
        instructions: [
          "In a heatproof bowl set over a pot of simmering water (don't let the bowl touch the water), melt the chocolate and butter together, stirring occasionally until smooth. Remove from heat and let cool slightly.",
          "In a separate bowl, whisk the egg yolks until smooth, then gradually whisk them into the cooled chocolate mixture.",
          "In another bowl, beat the egg whites with a pinch of salt until soft peaks form. Gradually add the sugar and continue beating until stiff peaks form.",
          "Gently fold the egg white mixture into the chocolate mixture.",
          "In another bowl, whip the heavy cream and vanilla until soft peaks form.",
          "Fold the whipped cream into the chocolate mixture until no streaks remain.",
          "Divide the mousse among 6 serving glasses or ramekins.",
          "Refrigerate for at least 2 hours, or up to 24 hours.",
          "Before serving, garnish with chocolate shavings and a dollop of whipped cream if desired.",
        ],
      },
    ],
    // Add similar detailed recipes for other categories...
    // For brevity, I'm not including all categories, but in a real implementation, you would have detailed recipes for each category
    salads: [
      {
        id: "salad-1",
        title: "Caesar Salad",
        cookTime: "15 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 head romaine lettuce, washed and chopped",
          "1 cup croutons",
          "1/2 cup grated Parmesan cheese",
          "Caesar dressing (store-bought or homemade)",
          "Optional: grilled chicken or shrimp",
        ],
        instructions: [
          "In a large bowl, combine the romaine lettuce, croutons, and Parmesan cheese.",
          "Add Caesar dressing to taste and toss gently to coat.",
          "If desired, top with grilled chicken or shrimp.",
          "Serve immediately.",
        ],
      },
      {
        id: "salad-2",
        title: "Greek Salad",
        cookTime: "10 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 cucumber, peeled, seeded, and chopped",
          "1 red bell pepper, seeded and chopped",
          "1/2 red onion, thinly sliced",
          "1 cup cherry tomatoes, halved",
          "1/2 cup Kalamata olives",
          "4 oz feta cheese, crumbled",
          "Greek dressing (store-bought or homemade)",
        ],
        instructions: [
          "In a large bowl, combine the cucumber, red bell pepper, red onion, cherry tomatoes, and Kalamata olives.",
          "Add feta cheese and Greek dressing to taste.",
          "Toss gently to combine.",
          "Serve immediately.",
        ],
      },
      {
        id: "salad-3",
        title: "Cobb Salad",
        cookTime: "20 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "8 cups mixed greens",
          "2 grilled chicken breasts, sliced",
          "4 slices bacon, cooked and crumbled",
          "2 hard-boiled eggs, chopped",
          "1 avocado, diced",
          "1/2 cup cherry tomatoes, halved",
          "1/4 cup crumbled blue cheese",
          "Cobb salad dressing (store-bought or homemade)",
        ],
        instructions: [
          "Arrange the mixed greens on a large platter or in individual bowls.",
          "Arrange the chicken, bacon, eggs, avocado, tomatoes, and blue cheese in rows over the greens.",
          "Drizzle with Cobb salad dressing to taste.",
          "Serve immediately.",
        ],
      },
      {
        id: "salad-4",
        title: "Caprese Salad",
        cookTime: "10 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pound fresh mozzarella, sliced",
          "1 pound ripe tomatoes, sliced",
          "Fresh basil leaves",
          "Balsamic glaze",
          "Olive oil",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Arrange the mozzarella and tomato slices alternately on a platter.",
          "Tuck fresh basil leaves between the slices.",
          "Drizzle with balsamic glaze and olive oil.",
          "Season with salt and pepper to taste.",
          "Serve immediately.",
        ],
      },
      {
        id: "salad-5",
        title: "Waldorf Salad",
        cookTime: "15 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "4 cups chopped apples (such as Granny Smith or Fuji)",
          "2 cups chopped celery",
          "1 cup halved red grapes",
          "1/2 cup chopped walnuts",
          "1/2 cup mayonnaise",
          "2 tablespoons lemon juice",
          "Salt and pepper to taste",
        ],
        instructions: [
          "In a large bowl, combine the apples, celery, grapes, and walnuts.",
          "In a small bowl, whisk together the mayonnaise and lemon juice.",
          "Add the dressing to the apple mixture and toss gently to coat.",
          "Season with salt and pepper to taste.",
          "Serve chilled.",
        ],
      },
      {
        id: "salad-6",
        title: "Quinoa Salad",
        cookTime: "25 mins",
        servings: "6 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 cup quinoa, cooked",
          "1 cucumber, chopped",
          "1 red bell pepper, chopped",
          "1/2 cup chopped red onion",
          "1/2 cup chopped fresh parsley",
          "1/4 cup lemon juice",
          "2 tablespoons olive oil",
          "Salt and pepper to taste",
        ],
        instructions: [
          "In a large bowl, combine the cooked quinoa, cucumber, red bell pepper, red onion, and parsley.",
          "In a small bowl, whisk together the lemon juice and olive oil.",
          "Add the dressing to the quinoa mixture and toss gently to coat.",
          "Season with salt and pepper to taste.",
          "Serve chilled.",
        ],
      },
      {
        id: "salad-7",
        title: "Taco Salad",
        cookTime: "20 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pound ground beef, cooked and seasoned with taco seasoning",
          "8 cups shredded lettuce",
          "1 cup crushed tortilla chips",
          "1 cup shredded cheddar cheese",
          "1/2 cup salsa",
          "1/4 cup sour cream",
          "Optional: chopped tomatoes, onions, avocado",
        ],
        instructions: [
          "In a large bowl or individual bowls, layer the lettuce, ground beef, tortilla chips, and cheddar cheese.",
          "Top with salsa and sour cream.",
          "If desired, add chopped tomatoes, onions, and avocado.",
          "Serve immediately.",
        ],
      },
      {
        id: "salad-8",
        title: "Asian Chicken Salad",
        cookTime: "25 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "4 cups shredded cabbage",
          "2 cups shredded carrots",
          "2 grilled chicken breasts, sliced",
          "1/2 cup chopped green onions",
          "1/4 cup sliced almonds",
          "1/4 cup sesame seeds",
          "Asian dressing (store-bought or homemade)",
        ],
        instructions: [
          "In a large bowl, combine the cabbage, carrots, chicken, green onions, almonds, and sesame seeds.",
          "Add Asian dressing to taste and toss gently to coat.",
          "Serve immediately.",
        ],
      },
      {
        id: "salad-9",
        title: "Mediterranean Chickpea Salad",
        cookTime: "15 mins",
        servings: "6 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 (15-ounce) cans chickpeas, drained and rinsed",
          "1 cucumber, chopped",
          "1 red bell pepper, chopped",
          "1/2 cup chopped red onion",
          "1/2 cup chopped fresh parsley",
          "1/4 cup lemon juice",
          "2 tablespoons olive oil",
          "Salt and pepper to taste",
        ],
        instructions: [
          "In a large bowl, combine the chickpeas, cucumber, red bell pepper, red onion, and parsley.",
          "In a small bowl, whisk together the lemon juice and olive oil.",
          "Add the dressing to the chickpea mixture and toss gently to coat.",
          "Season with salt and pepper to taste.",
          "Serve chilled.",
        ],
      },
      {
        id: "salad-10",
        title: "Potato Salad",
        cookTime: "30 mins",
        servings: "8 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 pounds potatoes, peeled and cubed",
          "1 cup mayonnaise",
          "1/4 cup yellow mustard",
          "1/4 cup chopped celery",
          "1/4 cup chopped red onion",
          "2 hard-boiled eggs, chopped",
          "Salt and pepper to taste",
          "Paprika for garnish",
        ],
        instructions: [
          "Boil the potatoes until tender, about 15-20 minutes. Drain and let cool.",
          "In a large bowl, combine the mayonnaise, mustard, celery, red onion, and eggs.",
          "Add the cooled potatoes and toss gently to coat.",
          "Season with salt and pepper to taste.",
          "Garnish with paprika.",
          "Serve chilled.",
        ],
      },
    ],
    soups: [
      {
        id: "soup-1",
        title: "Chicken Noodle Soup",
        cookTime: "45 mins",
        servings: "6 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 tablespoon olive oil",
          "1 onion, chopped",
          "2 carrots, chopped",
          "2 celery stalks, chopped",
          "8 cups chicken broth",
          "1 pound boneless, skinless chicken breasts, cubed",
          "1 cup egg noodles",
          "Salt and pepper to taste",
          "Fresh parsley, chopped",
        ],
        instructions: [
          "Heat the olive oil in a large pot over medium heat.",
          "Add the onion, carrots, and celery and cook until softened, about 5-7 minutes.",
          "Pour in the chicken broth and bring to a boil.",
          "Add the chicken and cook until cooked through, about 8-10 minutes.",
          "Stir in the egg noodles and cook until tender, about 5-7 minutes.",
          "Season with salt and pepper to taste.",
          "Garnish with fresh parsley before serving.",
        ],
      },
      {
        id: "soup-2",
        title: "Tomato Basil Soup",
        cookTime: "30 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 tablespoon olive oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "2 (28-ounce) cans crushed tomatoes",
          "4 cups vegetable broth",
          "1/2 cup heavy cream",
          "1/4 cup chopped fresh basil",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Heat the olive oil in a large pot over medium heat.",
          "Add the onion and garlic and cook until softened, about 5-7 minutes.",
          "Stir in the crushed tomatoes and vegetable broth.",
          "Bring to a boil, then reduce heat and simmer for 15 minutes.",
          "Stir in the heavy cream and basil.",
          "Season with salt and pepper to taste.",
          "Serve hot.",
        ],
      },
      {
        id: "soup-3",
        title: "French Onion Soup",
        cookTime: "1 hour",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 tablespoons butter",
          "4 large onions, thinly sliced",
          "1 teaspoon sugar",
          "8 cups beef broth",
          "1/2 cup dry red wine",
          "1 baguette, sliced",
          "4 slices Gruyere cheese",
        ],
        instructions: [
          "Melt the butter in a large pot over medium heat.",
          "Add the onions and sugar and cook, stirring occasionally, until caramelized, about 30-40 minutes.",
          "Pour in the beef broth and red wine and bring to a boil.",
          "Reduce heat and simmer for 15 minutes.",
          "Preheat the broiler.",
          "Place the baguette slices on a baking sheet and broil until toasted.",
          "Ladle the soup into oven-safe bowls.",
          "Top each bowl with a toasted baguette slice and a slice of Gruyere cheese.",
          "Broil until the cheese is melted and bubbly.",
          "Serve immediately.",
        ],
      },
      {
        id: "soup-4",
        title: "Minestrone Soup",
        cookTime: "40 mins",
        servings: "6 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 tablespoon olive oil",
          "1 onion, chopped",
          "2 carrots, chopped",
          "2 celery stalks, chopped",
          "2 cloves garlic, minced",
          "8 cups vegetable broth",
          "1 (15-ounce) can diced tomatoes",
          "1 (15-ounce) can kidney beans, drained and rinsed",
          "1 cup small pasta (such as ditalini)",
          "1 cup chopped zucchini",
          "1 cup chopped green beans",
          "Salt and pepper to taste",
          "Fresh parsley, chopped",
          "Grated Parmesan cheese",
        ],
        instructions: [
          "Heat the olive oil in a large pot over medium heat.",
          "Add the onion, carrots, and celery and cook until softened, about 5-7 minutes.",
          "Add the garlic and cook for 1 minute more.",
          "Pour in the vegetable broth and add the diced tomatoes and kidney beans.",
          "Bring to a boil, then reduce heat and simmer for 15 minutes.",
          "Stir in the pasta, zucchini, and green beans and cook until the pasta is tender, about 8-10 minutes.",
          "Season with salt and pepper to taste.",
          "Garnish with fresh parsley and grated Parmesan cheese before serving.",
        ],
      },
      {
        id: "soup-5",
        title: "Butternut Squash Soup",
        cookTime: "50 mins",
        servings: "6 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 butternut squash (about 2 pounds), peeled, seeded, and cubed",
          "1 tablespoon olive oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "6 cups vegetable broth",
          "1/2 cup heavy cream",
          "Salt and pepper to taste",
          "Croutons for garnish",
        ],
        instructions: [
          "Preheat oven to 400°F (200°C).",
          "Toss the butternut squash with olive oil and spread on a baking sheet.",
          "Roast for 30-40 minutes, or until tender.",
          "Heat the olive oil in a large pot over medium heat.",
          "Add the onion and garlic and cook until softened, about 5-7 minutes.",
          "Add the roasted butternut squash and vegetable broth.",
          "Bring to a boil, then reduce heat and simmer for 15 minutes.",
          "Puree the soup using an immersion blender or in a regular blender (in batches).",
          "Stir in the heavy cream.",
          "Season with salt and pepper to taste.",
          "Garnish with croutons before serving.",
        ],
      },
      {
        id: "soup-6",
        title: "Clam Chowder",
        cookTime: "45 mins",
        servings: "6 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "4 slices bacon, chopped",
          "1 onion, chopped",
          "2 celery stalks, chopped",
          "2 potatoes, peeled and cubed",
          "4 cups chicken broth",
          "2 (6.5-ounce) cans minced clams, undrained",
          "1 cup heavy cream",
          "Salt and pepper to taste",
          "Fresh parsley, chopped",
          "Oyster crackers",
        ],
        instructions: [
          "Cook the bacon in a large pot over medium heat until crisp.",
          "Remove the bacon and set aside, reserving the bacon fat in the pot.",
          "Add the onion and celery to the pot and cook until softened, about 5-7 minutes.",
          "Add the potatoes and chicken broth.",
          "Bring to a boil, then reduce heat and simmer for 15 minutes, or until the potatoes are tender.",
          "Stir in the clams and heavy cream.",
          "Season with salt and pepper to taste.",
          "Garnish with the cooked bacon and fresh parsley.",
          "Serve with oyster crackers.",
        ],
      },
      {
        id: "soup-7",
        title: "Lentil Soup",
        cookTime: "40 mins",
        servings: "6 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 tablespoon olive oil",
          "1 onion, chopped",
          "2 carrots, chopped",
          "2 celery stalks, chopped",
          "2 cloves garlic, minced",
          "8 cups vegetable broth",
          "1 cup brown or green lentils, rinsed",
          "1 (14.5-ounce) can diced tomatoes, undrained",
          "1 teaspoon dried thyme",
          "Salt and pepper to taste",
          "Lemon wedges for serving",
        ],
        instructions: [
          "Heat the olive oil in a large pot over medium heat.",
          "Add the onion, carrots, and celery and cook until softened, about 5-7 minutes.",
          "Add the garlic and cook for 1 minute more.",
          "Pour in the vegetable broth and add the lentils, diced tomatoes, and thyme.",
          "Bring to a boil, then reduce heat and simmer for 30 minutes, or until the lentils are tender.",
          "Season with salt and pepper to taste.",
          "Serve with lemon wedges.",
        ],
      },
      {
        id: "soup-8",
        title: "Miso Soup",
        cookTime: "15 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "4 cups water",
          "4 teaspoons dashi granules",
          "4 tablespoons miso paste",
          "4 ounces tofu, cubed",
          "2 green onions, thinly sliced",
          "Optional: wakame seaweed",
        ],
        instructions: [
          "Bring the water to a boil in a medium saucepan.",
          "Stir in the dashi granules.",
          "Reduce heat to low and whisk in the miso paste until dissolved.",
          "Add the tofu and wakame seaweed (if using).",
          "Simmer for 2-3 minutes.",
          "Garnish with green onions before serving.",
        ],
      },
      {
        id: "soup-9",
        title: "Beef Stew",
        cookTime: "2 hours",
        servings: "8 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 pounds beef stew meat, cubed",
          "2 tablespoons olive oil",
          "1 onion, chopped",
          "2 carrots, chopped",
          "2 celery stalks, chopped",
          "2 cloves garlic, minced",
          "8 cups beef broth",
          "1 cup dry red wine",
          "2 tablespoons tomato paste",
          "1 teaspoon dried thyme",
          "2 bay leaves",
          "2 pounds potatoes, peeled and cubed",
          "Salt and pepper to taste",
          "Fresh parsley, chopped",
        ],
        instructions: [
          "Season the beef with salt and pepper.",
          "Heat the olive oil in a large pot or Dutch oven over medium-high heat.",
          "Add the beef and brown on all sides.",
          "Remove the beef and set aside.",
          "Add the onion, carrots, and celery to the pot and cook until softened, about 5-7 minutes.",
          "Add the garlic and cook for 1 minute more.",
          "Stir in the beef broth, red wine, tomato paste, thyme, and bay leaves.",
          "Bring to a boil, then reduce heat and simmer for 1 1/2 hours.",
          "Add the potatoes and cook for 30 minutes more, or until the potatoes are tender.",
          "Return the beef to the pot and heat through.",
          "Remove the bay leaves before serving.",
          "Garnish with fresh parsley.",
        ],
      },
      {
        id: "soup-10",
        title: "Thai Coconut Soup",
        cookTime: "30 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 tablespoon coconut oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 red bell pepper, sliced",
          "4 cups chicken broth",
          "1 (13.5-ounce) can coconut milk",
          "2 tablespoons red curry paste",
          "1 tablespoon fish sauce",
          "1 tablespoon lime juice",
          "1 cup sliced mushrooms",
          "1 cup cubed chicken or tofu",
          "Fresh cilantro, chopped",
          "Lime wedges for serving",
        ],
        instructions: [
          "Heat the coconut oil in a large pot over medium heat.",
          "Add the onion and garlic and cook until softened, about 5-7 minutes.",
          "Add the red bell pepper and cook for 2 minutes more.",
          "Stir in the chicken broth, coconut milk, red curry paste, and fish sauce.",
          "Bring to a boil, then reduce heat and simmer for 10 minutes.",
          "Add the mushrooms and chicken or tofu and cook until the chicken is cooked through or the tofu is heated through, about 5-7 minutes.",
          "Stir in the lime juice.",
          "Garnish with fresh cilantro.",
          "Serve with lime wedges.",
        ],
      },
    ],
    beverages: [
      {
        id: "beverage-1",
        title: "Strawberry Smoothie",
        cookTime: "5 mins",
        servings: "2 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 cup frozen strawberries",
          "1/2 banana",
          "1/2 cup yogurt",
          "1/2 cup milk",
          "1 tablespoon honey (optional)",
        ],
        instructions: ["Combine all ingredients in a blender.", "Blend until smooth.", "Serve immediately."],
      },
      {
        id: "beverage-2",
        title: "Iced Coffee",
        cookTime: "10 mins",
        servings: "1 serving",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 cup brewed coffee, cooled",
          "1/2 cup milk or cream",
          "2 tablespoons simple syrup or sugar",
          "Ice cubes",
        ],
        instructions: ["Combine all ingredients in a glass.", "Stir well.", "Add ice cubes.", "Serve immediately."],
      },
      {
        id: "beverage-3",
        title: "Homemade Lemonade",
        cookTime: "15 mins",
        servings: "6 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 cup sugar",
          "1 cup water",
          "6 lemons, juiced",
          "4 cups cold water",
          "Lemon slices for garnish",
        ],
        instructions: [
          "In a small saucepan, combine the sugar and 1 cup of water.",
          "Bring to a boil, stirring until the sugar is dissolved.",
          "Remove from heat and let cool.",
          "In a pitcher, combine the lemon juice, simple syrup, and 4 cups of cold water.",
          "Stir well.",
          "Add lemon slices for garnish.",
          "Serve chilled.",
        ],
      },
      {
        id: "beverage-4",
        title: "Mango Lassi",
        cookTime: "5 mins",
        servings: "2 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 cup chopped mango",
          "1 cup yogurt",
          "1/2 cup milk",
          "2 tablespoons sugar or honey",
          "Pinch of cardamom (optional)",
        ],
        instructions: ["Combine all ingredients in a blender.", "Blend until smooth.", "Serve chilled."],
      },
      {
        id: "beverage-5",
        title: "Hot Chocolate",
        cookTime: "10 mins",
        servings: "2 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 cups milk",
          "2 tablespoons cocoa powder",
          "2 tablespoons sugar",
          "1/4 teaspoon vanilla extract",
          "Pinch of salt",
          "Whipped cream or marshmallows for topping",
        ],
        instructions: [
          "In a saucepan, combine the milk, cocoa powder, sugar, vanilla extract, and salt.",
          "Heat over medium heat, stirring constantly, until the mixture is hot but not boiling.",
          "Pour into mugs.",
          "Top with whipped cream or marshmallows.",
          "Serve immediately.",
        ],
      },
      {
        id: "beverage-6",
        title: "Green Tea Matcha Latte",
        cookTime: "5 mins",
        servings: "1 serving",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 teaspoon matcha powder",
          "2 tablespoons hot water",
          "1 cup milk",
          "1 tablespoon honey or sugar (optional)",
        ],
        instructions: [
          "Whisk the matcha powder with the hot water until smooth.",
          "Heat the milk in a saucepan or microwave.",
          "Pour the matcha mixture into a mug.",
          "Top with the heated milk.",
          "Add honey or sugar if desired.",
          "Serve immediately.",
        ],
      },
      {
        id: "beverage-7",
        title: "Fruit Punch",
        cookTime: "15 mins",
        servings: "8 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "4 cups cranberry juice",
          "4 cups pineapple juice",
          "2 cups orange juice",
          "1 cup lemon-lime soda",
          "Fruit slices for garnish",
        ],
        instructions: [
          "Combine all ingredients in a punch bowl.",
          "Stir well.",
          "Add fruit slices for garnish.",
          "Serve chilled.",
        ],
      },
      {
        id: "beverage-8",
        title: "Chai Tea",
        cookTime: "10 mins",
        servings: "2 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 cups water",
          "2 chai tea bags or 2 teaspoons loose leaf chai tea",
          "1 cup milk",
          "2 tablespoons sugar or honey",
        ],
        instructions: [
          "Bring the water to a boil in a saucepan.",
          "Add the chai tea bags or loose leaf tea.",
          "Reduce heat and simmer for 5 minutes.",
          "Remove the tea bags or strain the tea.",
          "Stir in the milk and sugar or honey.",
          "Heat through.",
          "Serve immediately.",
        ],
      },
      {
        id: "beverage-9",
        title: "Watermelon Juice",
        cookTime: "10 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: ["4 cups cubed watermelon", "1/4 cup water", "Lime juice to taste"],
        instructions: [
          "Combine the watermelon and water in a blender.",
          "Blend until smooth.",
          "Strain the juice through a fine-mesh sieve.",
          "Add lime juice to taste.",
          "Serve chilled.",
        ],
      },
      {
        id: "beverage-10",
        title: "Protein Shake",
        cookTime: "5 mins",
        servings: "1 serving",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 scoop protein powder",
          "1 cup milk or water",
          "1/2 banana",
          "1 tablespoon peanut butter (optional)",
          "Ice cubes",
        ],
        instructions: ["Combine all ingredients in a blender.", "Blend until smooth.", "Serve immediately."],
      },
    ],
    meat: [
      {
        id: "meat-1",
        title: "Beef Wellington",
        cookTime: "1.5 hours",
        servings: "6 servings",
        difficulty: "Hard",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 pounds beef tenderloin",
          "Salt and pepper to taste",
          "2 tablespoons olive oil",
          "1 onion, chopped",
          "8 ounces mushrooms, chopped",
          "1/2 cup dry sherry",
          "1/4 cup chopped fresh parsley",
          "1 sheet puff pastry, thawed",
          "4 ounces pâté",
          "1 egg, beaten",
        ],
        instructions: [
          "Preheat oven to 400°F (200°C).",
          "Season the beef with salt and pepper.",
          "Heat the olive oil in a large skillet over medium-high heat.",
          "Add the beef and sear on all sides.",
          "Remove the beef and set aside.",
          "Add the onion and mushrooms to the skillet and cook until softened, about 5-7 minutes.",
          "Stir in the sherry and parsley.",
          "Remove from heat and let cool.",
          "Roll out the puff pastry on a floured surface.",
          "Spread the pâté over the beef.",
          "Spread the mushroom mixture over the pâté.",
          "Wrap the beef in the puff pastry.",
          "Brush with the beaten egg.",
          "Bake for 30-40 minutes, or until the puff pastry is golden brown.",
          "Let rest for 10 minutes before slicing and serving.",
        ],
      },
      {
        id: "meat-2",
        title: "Roast Chicken",
        cookTime: "1.5 hours",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 (4-pound) whole chicken",
          "Salt and pepper to taste",
          "1 lemon, quartered",
          "4 sprigs fresh thyme",
          "2 tablespoons olive oil",
          "1 onion, quartered",
          "4 carrots, chopped",
          "4 celery stalks, chopped",
        ],
        instructions: [
          "Preheat oven to 425°F (220°C).",
          "Season the chicken with salt and pepper.",
          "Place the lemon quarters and thyme sprigs inside the chicken cavity.",
          "Rub the chicken with olive oil.",
          "Place the onion, carrots, and celery in the bottom of a roasting pan.",
          "Place the chicken on top of the vegetables.",
          "Roast for 1 hour and 15 minutes, or until the chicken is cooked through and the juices run clear when pierced with a fork.",
          "Let rest for 10 minutes before carving and serving.",
        ],
      },
      {
        id: "meat-3",
        title: "Beef Stroganoff",
        cookTime: "45 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pound beef sirloin, thinly sliced",
          "Salt and pepper to taste",
          "2 tablespoons butter",
          "1 onion, chopped",
          "8 ounces mushrooms, sliced",
          "2 cloves garlic, minced",
          "1/2 cup beef broth",
          "1/4 cup dry sherry",
          "1 cup sour cream",
          "2 tablespoons chopped fresh parsley",
          "Egg noodles or rice for serving",
        ],
        instructions: [
          "Season the beef with salt and pepper.",
          "Melt the butter in a large skillet over medium heat.",
          "Add the beef and cook until browned.",
          "Remove the beef and set aside.",
          "Add the onion and mushrooms to the skillet and cook until softened, about 5-7 minutes.",
          "Add the garlic and cook for 1 minute more.",
          "Stir in the beef broth and sherry.",
          "Bring to a boil, then reduce heat and simmer for 10 minutes.",
          "Stir in the sour cream and parsley.",
          "Return the beef to the skillet and heat through.",
          "Serve over egg noodles or rice.",
        ],
      },
      {
        id: "meat-4",
        title: "Pork Chops",
        cookTime: "30 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "4 (6-ounce) pork chops",
          "Salt and pepper to taste",
          "2 tablespoons olive oil",
          "2 cloves garlic, minced",
          "1/4 cup chicken broth",
          "1 tablespoon Dijon mustard",
          "1 tablespoon honey",
          "Fresh thyme sprigs",
        ],
        instructions: [
          "Season the pork chops with salt and pepper.",
          "Heat the olive oil in a large skillet over medium-high heat.",
          "Add the pork chops and cook until browned on both sides and cooked through, about 5-7 minutes per side.",
          "Remove the pork chops and set aside.",
          "Add the garlic to the skillet and cook for 1 minute.",
          "Stir in the chicken broth, Dijon mustard, and honey.",
          "Bring to a boil, then reduce heat and simmer for 5 minutes.",
          "Return the pork chops to the skillet and heat through.",
          "Garnish with fresh thyme sprigs.",
          "Serve immediately.",
        ],
      },
      {
        id: "meat-5",
        title: "Lamb Curry",
        cookTime: "1 hour",
        servings: "6 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 pounds lamb stew meat, cubed",
          "Salt and pepper to taste",
          "2 tablespoons vegetable oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 tablespoon grated ginger",
          "2 tablespoons curry powder",
          "1 teaspoon turmeric",
          "1/2 teaspoon cayenne pepper (optional)",
          "1 (14.5-ounce) can diced tomatoes, undrained",
          "1 cup chicken broth",
          "1 cup coconut milk",
          "1 cup frozen peas",
          "Fresh cilantro, chopped",
          "Rice for serving",
        ],
        instructions: [
          "Season the lamb with salt and pepper.",
          "Heat the vegetable oil in a large pot or Dutch oven over medium-high heat.",
          "Add the lamb and brown on all sides.",
          "Remove the lamb and set aside.",
          "Add the onion to the pot and cook until softened, about 5-7 minutes.",
          "Add the garlic and ginger and cook for 1 minute more.",
          "Stir in the curry powder, turmeric, and cayenne pepper (if using).",
          "Cook for 1 minute more.",
          "Stir in the diced tomatoes and chicken broth.",
          "Bring to a boil, then reduce heat and simmer for 45 minutes.",
          "Stir in the coconut milk and peas.",
          "Return the lamb to the pot and heat through.",
          "Garnish with fresh cilantro.",
          "Serve over rice.",
        ],
      },
      {
        id: "meat-6",
        title: "Beef Tacos",
        cookTime: "30 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pound ground beef",
          "1 packet taco seasoning",
          "1/2 cup water",
          "12 taco shells",
          "Shredded lettuce",
          "Chopped tomatoes",
          "Shredded cheddar cheese",
          "Salsa",
          "Sour cream",
        ],
        instructions: [
          "Brown the ground beef in a large skillet over medium heat.",
          "Drain off any excess grease.",
          "Stir in the taco seasoning and water.",
          "Bring to a boil, then reduce heat and simmer for 5 minutes.",
          "Warm the taco shells according to package directions.",
          "Fill the taco shells with the beef mixture.",
          "Top with shredded lettuce, chopped tomatoes, shredded cheddar cheese, salsa, and sour cream.",
          "Serve immediately.",
        ],
      },
      {
        id: "meat-7",
        title: "Chicken Parmesan",
        cookTime: "45 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "4 (6-ounce) chicken breasts",
          "1/2 cup all-purpose flour",
          "1 teaspoon salt",
          "1/2 teaspoon pepper",
          "2 eggs, beaten",
          "1 cup bread crumbs",
          "1/2 cup grated Parmesan cheese",
          "1/4 cup olive oil",
          "1 (24-ounce) jar marinara sauce",
          "8 ounces mozzarella cheese, sliced",
          "Fresh basil leaves",
        ],
        instructions: [
          "Preheat oven to 375°F (190°C).",
          "Pound the chicken breasts to 1/2-inch thickness.",
          "In a shallow dish, combine the flour, salt, and pepper.",
          "In another shallow dish, beat the eggs.",
          "In a third shallow dish, combine the bread crumbs and Parmesan cheese.",
          "Dip each chicken breast in the flour mixture, then the eggs, then the bread crumb mixture.",
          "Heat the olive oil in a large skillet over medium heat.",
          "Add the chicken breasts and cook until golden brown on both sides, about 5-7 minutes per side.",
          "Place the chicken breasts in a baking dish.",
          "Top with the marinara sauce and mozzarella cheese.",
          "Bake for 20-25 minutes, or until the cheese is melted and bubbly.",
          "Garnish with fresh basil leaves.",
          "Serve immediately.",
        ],
      },
      {
        id: "meat-8",
        title: "Meatloaf",
        cookTime: "1 hour",
        servings: "6 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 pounds ground beef",
          "1 cup bread crumbs",
          "1 onion, chopped",
          "1 egg",
          "1/2 cup milk",
          "1/4 cup ketchup",
          "1 tablespoon Worcestershire sauce",
          "1 teaspoon salt",
          "1/2 teaspoon pepper",
          "1/2 cup ketchup (for topping)",
        ],
        instructions: [
          "Preheat oven to 350°F (175°C).",
          "In a large bowl, combine the ground beef, bread crumbs, onion, egg, milk, ketchup, Worcestershire sauce, salt, and pepper.",
          "Mix well.",
          "Shape the mixture into a loaf and place in a baking dish.",
          "Top with the remaining ketchup.",
          "Bake for 1 hour, or until cooked through.",
          "Let rest for 10 minutes before slicing and serving.",
        ],
      },
      {
        id: "meat-9",
        title: "BBQ Ribs",
        cookTime: "3 hours",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "4 pounds pork ribs",
          "Salt and pepper to taste",
          "2 tablespoons paprika",
          "1 tablespoon garlic powder",
          "1 tablespoon onion powder",
          "1 teaspoon cayenne pepper (optional)",
          "2 cups barbecue sauce",
        ],
        instructions: [
          "Preheat oven to 300°F (150°C).",
          "Season the ribs with salt, pepper, paprika, garlic powder, onion powder, and cayenne pepper (if using).",
          "Wrap the ribs in aluminum foil and bake for 2 hours.",
          "Remove the ribs from the oven and unwrap.",
          "Brush with barbecue sauce.",
          "Return to the oven and bake for 1 hour more, brushing with barbecue sauce every 20 minutes.",
          "Let rest for 10 minutes before slicing and serving.",
        ],
      },
      {
        id: "meat-10",
        title: "Turkey Meatballs",
        cookTime: "40 mins",
        servings: "6 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pound ground turkey",
          "1/2 cup bread crumbs",
          "1/4 cup grated Parmesan cheese",
          "1 egg",
          "1/4 cup chopped fresh parsley",
          "1 clove garlic, minced",
          "1/2 teaspoon salt",
          "1/4 teaspoon pepper",
          "Marinara sauce",
        ],
        instructions: [
          "Preheat oven to 375°F (190°C).",
          "In a large bowl, combine the ground turkey, bread crumbs, Parmesan cheese, egg, parsley, garlic, salt, and pepper.",
          "Mix well.",
          "Shape the mixture into meatballs and place in a baking dish.",
          "Bake for 30-35 minutes, or until cooked through.",
          "Serve with marinara sauce.",
        ],
      },
    ],
    seafood: [
      {
        id: "seafood-1",
        title: "Grilled Salmon",
        cookTime: "20 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "4 (6-ounce) salmon fillets",
          "2 tablespoons olive oil",
          "1 lemon, sliced",
          "Salt and pepper to taste",
          "Fresh dill sprigs",
        ],
        instructions: [
          "Preheat grill to medium heat.",
          "Brush the salmon fillets with olive oil.",
          "Season with salt and pepper.",
          "Place the salmon fillets on the grill.",
          "Grill for 5-7 minutes per side, or until cooked through.",
          "Top with lemon slices and fresh dill sprigs.",
          "Serve immediately.",
        ],
      },
      {
        id: "seafood-2",
        title: "Shrimp Scampi",
        cookTime: "15 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pound shrimp, peeled and deveined",
          "4 tablespoons butter",
          "4 cloves garlic, minced",
          "1/4 cup dry white wine",
          "2 tablespoons lemon juice",
          "1/4 cup chopped fresh parsley",
          "Salt and pepper to taste",
          "Linguine or angel hair pasta",
        ],
        instructions: [
          "Cook the pasta according to package directions.",
          "Melt the butter in a large skillet over medium heat.",
          "Add the garlic and cook for 1 minute.",
          "Add the shrimp and cook until pink, about 3-5 minutes.",
          "Stir in the white wine and lemon juice.",
          "Bring to a boil, then reduce heat and simmer for 5 minutes.",
          "Stir in the parsley.",
          "Season with salt and pepper to taste.",
          "Serve over the cooked pasta.",
        ],
      },
      {
        id: "seafood-3",
        title: "Fish Tacos",
        cookTime: "25 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pound white fish fillets (such as cod or tilapia)",
          "1 tablespoon olive oil",
          "1 teaspoon chili powder",
          "1/2 teaspoon cumin",
          "1/4 teaspoon cayenne pepper (optional)",
          "Salt and pepper to taste",
          "12 corn tortillas",
          "Shredded cabbage",
          "Salsa",
          "Sour cream",
          "Lime wedges",
        ],
        instructions: [
          "Preheat oven to 400°F (200°C).",
          "Brush the fish fillets with olive oil.",
          "Season with chili powder, cumin, cayenne pepper (if using), salt, and pepper.",
          "Bake for 10-12 minutes, or until cooked through.",
          "Warm the tortillas according to package directions.",
          "Flake the fish with a fork.",
          "Fill the tortillas with the fish, shredded cabbage, salsa, and sour cream.",
          "Serve with lime wedges.",
        ],
      },
      {
        id: "seafood-4",
        title: "Lobster Bisque",
        cookTime: "45 mins",
        servings: "6 servings",
        difficulty: "Hard",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 lobsters (about 1.5 pounds each)",
          "2 tablespoons olive oil",
          "1 onion, chopped",
          "2 carrots, chopped",
          "2 celery stalks, chopped",
          "2 cloves garlic, minced",
          "1/2 cup dry sherry",
          "8 cups fish broth",
          "1 cup heavy cream",
          "2 tablespoons tomato paste",
          "1 teaspoon dried thyme",
          "Salt and pepper to taste",
          "Fresh parsley, chopped",
        ],
        instructions: [
          "Cook the lobsters according to package directions.",
          "Remove the meat from the lobsters and set aside.",
          "Heat the olive oil in a large pot over medium heat.",
          "Add the onion, carrots, and celery and cook until softened, about 5-7 minutes.",
          "Add the garlic and cook for 1 minute more.",
          "Stir in the sherry and cook for 1 minute more.",
          "Stir in the fish broth, heavy cream, tomato paste, and thyme.",
          "Bring to a boil, then reduce heat and simmer for 30 minutes.",
          "Puree the soup using an immersion blender or in a regular blender (in batches).",
          "Stir in the lobster meat.",
          "Season with salt and pepper to taste.",
          "Garnish with fresh parsley.",
          "Serve immediately.",
        ],
      },
      {
        id: "seafood-5",
        title: "Crab Cakes",
        cookTime: "30 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pound crab meat",
          "1/2 cup bread crumbs",
          "1/4 cup mayonnaise",
          "1 egg",
          "1 tablespoon Dijon mustard",
          "1 tablespoon Worcestershire sauce",
          "1/4 cup chopped red bell pepper",
          "1/4 cup chopped green onions",
          "Salt and pepper to taste",
          "Olive oil",
        ],
        instructions: [
          "In a large bowl, combine the crab meat, bread crumbs, mayonnaise, egg, Dijon mustard, Worcestershire sauce, red bell pepper, and green onions.",
          "Season with salt and pepper to taste.",
          "Mix well.",
          "Shape the mixture into crab cakes.",
          "Heat the olive oil in a large skillet over medium heat.",
          "Add the crab cakes and cook until golden brown on both sides, about 5-7 minutes per side.",
          "Serve immediately.",
        ],
      },
      {
        id: "seafood-6",
        title: "Tuna Poke Bowl",
        cookTime: "20 mins",
        servings: "2 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pound sushi-grade tuna, cubed",
          "1/4 cup soy sauce",
          "2 tablespoons sesame oil",
          "1 tablespoon rice vinegar",
          "1 tablespoon sriracha",
          "1/4 cup chopped green onions",
          "1/4 cup chopped seaweed salad",
          "1 avocado, diced",
          "Cooked rice",
        ],
        instructions: [
          "In a bowl, combine the tuna, soy sauce, sesame oil, rice vinegar, and sriracha.",
          "Mix well.",
          "Let marinate for 10 minutes.",
          "Divide the rice between two bowls.",
          "Top with the tuna mixture, green onions, seaweed salad, and avocado.",
          "Serve immediately.",
        ],
      },
      {
        id: "seafood-7",
        title: "Clam Linguine",
        cookTime: "30 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pound linguine",
          "2 tablespoons olive oil",
          "4 cloves garlic, minced",
          "1/2 teaspoon red pepper flakes",
          "1/2 cup dry white wine",
          "2 (10-ounce) cans chopped clams, undrained",
          "1/4 cup chopped fresh parsley",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Cook the linguine according to package directions.",
          "Heat the olive oil in a large skillet over medium heat.",
          "Add the garlic and red pepper flakes and cook for 1 minute.",
          "Stir in the white wine and bring to a boil.",
          "Reduce heat and simmer for 5 minutes.",
          "Stir in the clams and parsley.",
          "Season with salt and pepper to taste.",
          "Drain the linguine and add to the skillet.",
          "Toss to combine.",
          "Serve immediately.",
        ],
      },
      {
        id: "seafood-8",
        title: "Mussels in White Wine",
        cookTime: "25 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 pounds mussels, scrubbed and debearded",
          "2 tablespoons olive oil",
          "4 cloves garlic, minced",
          "1/2 teaspoon red pepper flakes",
          "1/2 cup dry white wine",
          "1/4 cup chopped fresh parsley",
          "Salt and pepper to taste",
          "Crusty bread",
        ],
        instructions: [
          "Heat the olive oil in a large pot over medium heat.",
          "Add the garlic and red pepper flakes and cook for 1 minute.",
          "Stir in the white wine and bring to a boil.",
          "Add the mussels and cover.",
          "Cook until the mussels open, about 5-7 minutes.",
          "Discard any mussels that do not open.",
          "Stir in the parsley.",
          "Season with salt and pepper to taste.",
          "Serve with crusty bread.",
        ],
      },
      {
        id: "seafood-9",
        title: "Baked Cod",
        cookTime: "25 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "4 (6-ounce) cod fillets",
          "2 tablespoons olive oil",
          "1 lemon, sliced",
          "Salt and pepper to taste",
          "Fresh thyme sprigs",
        ],
        instructions: [
          "Preheat oven to 400°F (200°C).",
          "Brush the cod fillets with olive oil.",
          "Season with salt and pepper.",
          "Place the cod fillets in a baking dish.",
          "Top with lemon slices and fresh thyme sprigs.",
          "Bake for 15-20 minutes, or until cooked through.",
          "Serve immediately.",
        ],
      },
      {
        id: "seafood-10",
        title: "Sushi Rolls",
        cookTime: "45 mins",
        servings: "4 servings",
        difficulty: "Hard",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 cups sushi rice",
          "2 cups water",
          "1/4 cup rice vinegar",
          "2 tablespoons sugar",
          "1 teaspoon salt",
          "Nori sheets",
          "Sushi-grade fish (such as tuna or salmon)",
          "Avocado",
          "Cucumber",
          "Soy sauce",
          "Wasabi",
          "Pickled ginger",
        ],
        instructions: [
          "Rinse the sushi rice until the water runs clear.",
          "Combine the rice and water in a saucepan.",
          "Bring to a boil, then reduce heat and simmer for 15 minutes, or until the rice is cooked through.",
          "Remove from heat and let cool.",
          "In a small bowl, combine the rice vinegar, sugar, and salt.",
          "Stir until the sugar and salt are dissolved.",
          "Pour the vinegar mixture over the rice and mix well.",
          "Place a nori sheet on a bamboo sushi rolling mat.",
          "Spread a thin layer of rice over the nori sheet.",
          "Place the fish, avocado, and cucumber on top of the rice.",
          "Roll the sushi tightly using the bamboo mat.",
          "Slice the sushi into rolls.",
          "Serve with soy sauce, wasabi, and pickled ginger.",
        ],
      },
    ],
    vegetarian: [
      {
        id: "vegetarian-1",
        title: "Vegetable Stir Fry",
        cookTime: "20 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 tablespoon olive oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 red bell pepper, sliced",
          "1 green bell pepper, sliced",
          "1 cup broccoli florets",
          "1 cup sliced carrots",
          "1/4 cup soy sauce",
          "2 tablespoons sesame oil",
          "1 tablespoon cornstarch",
        ],
        instructions: [
          "Heat the olive oil in a large skillet or wok over medium-high heat.",
          "Add the onion and garlic and cook until softened, about 5-7 minutes.",
          "Add the red bell pepper, green bell pepper, broccoli florets, and carrots.",
          "Cook until the vegetables are tender-crisp, about 5-7 minutes.",
          "In a small bowl, whisk together the soy sauce, sesame oil, and cornstarch.",
          "Pour the sauce over the vegetables and cook until thickened, about 1-2 minutes.",
          "Serve immediately over rice or noodles.",
        ],
      },
      {
        id: "vegetarian-2",
        title: "Eggplant Parmesan",
        cookTime: "45 mins",
        servings: "6 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 eggplants, sliced",
          "Salt",
          "2 eggs, beaten",
          "1 cup bread crumbs",
          "1/2 cup grated Parmesan cheese",
          "1/4 cup olive oil",
          "1 (24-ounce) jar marinara sauce",
          "8 ounces mozzarella cheese, sliced",
          "Fresh basil leaves",
        ],
        instructions: [
          "Preheat oven to 375°F (190°C).",
          "Sprinkle the eggplant slices with salt and let sit for 30 minutes.",
          "Rinse the eggplant slices and pat dry.",
          "Dip each eggplant slice in the eggs, then the bread crumbs.",
          "Heat the olive oil in a large skillet over medium heat.",
          "Add the eggplant slices and cook until golden brown on both sides, about 5-7 minutes per side.",
          "Place the eggplant slices in a baking dish.",
          "Top with the marinara sauce and mozzarella cheese.",
          "Bake for 20-25 minutes, or until the cheese is melted and bubbly.",
          "Garnish with fresh basil leaves.",
          "Serve immediately.",
        ],
      },
      {
        id: "vegetarian-3",
        title: "Mushroom Risotto",
        cookTime: "40 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "6 cups vegetable broth",
          "2 tablespoons olive oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 1/2 cups Arborio rice",
          "1/2 cup dry white wine",
          "8 ounces mushrooms, sliced",
          "1/2 cup grated Parmesan cheese",
          "2 tablespoons butter",
          "Salt and pepper to taste",
          "Fresh parsley, chopped",
        ],
        instructions: [
          "Heat the vegetable broth in a saucepan and keep warm.",
          "Heat the olive oil in a large pot over medium heat.",
          "Add the onion and garlic and cook until softened, about 5-7 minutes.",
          "Add the rice and cook for 1 minute.",
          "Stir in the white wine and cook until absorbed.",
          "Add the mushrooms and cook until softened, about 5-7 minutes.",
          "Add 1 cup of the warm vegetable broth to the rice and stir until absorbed.",
          "Continue adding the broth, 1 cup at a time, stirring until absorbed before adding the next cup.",
          "Cook until the rice is creamy and al dente, about 20-25 minutes.",
          "Stir in the Parmesan cheese and butter.",
          "Season with salt and pepper to taste.",
          "Garnish with fresh parsley.",
          "Serve immediately.",
        ],
      },
      {
        id: "vegetarian-4",
        title: "Vegetable Lasagna",
        cookTime: "1 hour",
        servings: "8 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 tablespoon olive oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 red bell pepper, chopped",
          "1 green bell pepper, chopped",
          "1 cup sliced mushrooms",
          "1 (24-ounce) jar marinara sauce",
          "15 lasagna noodles",
          "15 ounces ricotta cheese",
          "1 egg",
          "1/2 cup grated Parmesan cheese",
          "8 ounces mozzarella cheese, sliced",
        ],
        instructions: [
          "Preheat oven to 375°F (190°C).",
          "Heat the olive oil in a large skillet over medium heat.",
          "Add the onion and garlic and cook until softened, about 5-7 minutes.",
          "Add the red bell pepper, green bell pepper, and mushrooms.",
          "Cook until the vegetables are tender-crisp, about 5-7 minutes.",
          "Stir in the marinara sauce.",
          "Cook the lasagna noodles according to package directions.",
          "In a bowl, combine the ricotta cheese, egg, and Parmesan cheese.",
          "Spread a thin layer of sauce in the bottom of a baking dish.",
          "Top with a layer of noodles, then a layer of ricotta cheese mixture, then a layer of mozzarella cheese.",
          "Repeat layers until all ingredients are used.",
          "Bake for 30-40 minutes, or until the cheese is melted and bubbly.",
          "Let rest for 10 minutes before slicing and serving.",
        ],
      },
      {
        id: "vegetarian-5",
        title: "Falafel Wrap",
        cookTime: "30 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 (15-ounce) can chickpeas, drained and rinsed",
          "1/2 cup chopped onion",
          "2 cloves garlic, minced",
          "1/4 cup chopped fresh parsley",
          "1 teaspoon cumin",
          "1/2 teaspoon coriander",
          "1/4 teaspoon cayenne pepper (optional)",
          "Salt and pepper to taste",
          "4 pita breads",
          "Hummus",
          "Shredded lettuce",
          "Chopped tomatoes",
          "Cucumber",
          "Tahini sauce",
        ],
        instructions: [
          "In a food processor, combine the chickpeas, onion, garlic, parsley, cumin, coriander, cayenne pepper (if using), salt, and pepper.",
          "Process until smooth.",
          "Shape the mixture into falafel patties.",
          "Heat the olive oil in a large skillet over medium heat.",
          "Add the falafel patties and cook until golden brown on both sides, about 5-7 minutes per side.",
          "Warm the pita breads.",
          "Spread hummus on each pita bread.",
          "Top with shredded lettuce, chopped tomatoes, cucumber, and falafel patties.",
          "Drizzle with tahini sauce.",
          "Serve immediately.",
        ],
      },
      {
        id: "vegetarian-6",
        title: "Tofu Stir Fry",
        cookTime: "25 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pound firm tofu, pressed and cubed",
          "2 tablespoons olive oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 red bell pepper, sliced",
          "1 green bell pepper, sliced",
          "1 cup broccoli florets",
          "1 cup sliced carrots",
          "1/4 cup soy sauce",
          "2 tablespoons sesame oil",
          "1 tablespoon cornstarch",
        ],
        instructions: [
          "Heat the olive oil in a large skillet or wok over medium-high heat.",
          "Add the tofu and cook until golden brown on all sides, about 5-7 minutes.",
          "Remove the tofu and set aside.",
          "Add the onion and garlic and cook until softened, about 5-7 minutes.",
          "Add the red bell pepper, green bell pepper, broccoli florets, and carrots.",
          "Cook until the vegetables are tender-crisp, about 5-7 minutes.",
          "In a small bowl, whisk together the soy sauce, sesame oil, and cornstarch.",
          "Pour the sauce over the vegetables and cook until thickened, about 1-2 minutes.",
          "Return the tofu to the skillet and heat through.",
          "Serve immediately over rice or noodles.",
        ],
      },
      {
        id: "vegetarian-7",
        title: "Spinach and Feta Pie",
        cookTime: "50 mins",
        servings: "6 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 tablespoon olive oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "10 ounces spinach, chopped",
          "4 eggs",
          "1 cup ricotta cheese",
          "1/2 cup crumbled feta cheese",
          "1/4 cup grated Parmesan cheese",
          "Salt and pepper to taste",
          "1 package phyllo dough, thawed",
        ],
        instructions: [
          "Preheat oven to 375°F (190°C).",
          "Heat the olive oil in a large skillet over medium heat.",
          "Add the onion and garlic and cook until softened, about 5-7 minutes.",
          "Add the spinach and cook until wilted, about 2-3 minutes.",
          "Remove from heat and let cool.",
          "In a bowl, combine the eggs, ricotta cheese, feta cheese, Parmesan cheese, salt, and pepper.",
          "Mix well.",
          "Stir in the spinach mixture.",
          "Brush a baking dish with olive oil.",
          "Layer 6 sheets of phyllo dough in the baking dish, brushing each sheet with olive oil.",
          "Pour the spinach mixture over the phyllo dough.",
          "Layer 6 sheets of phyllo dough over the spinach mixture, brushing each sheet with olive oil.",
          "Bake for 30-40 minutes, or until golden brown.",
          "Let rest for 10 minutes before slicing and serving.",
        ],
      },
      {
        id: "vegetarian-8",
        title: "Stuffed Bell Peppers",
        cookTime: "45 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "4 bell peppers (any color)",
          "1 tablespoon olive oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 cup cooked rice",
          "1 (15-ounce) can black beans, drained and rinsed",
          "1 (15-ounce) can corn, drained",
          "1/2 cup salsa",
          "1/4 cup chopped fresh cilantro",
          "1 cup shredded cheddar cheese",
        ],
        instructions: [
          "Preheat oven to 375°F (190°C).",
          "Cut the bell peppers in half lengthwise and remove the seeds.",
          "Heat the olive oil in a large skillet over medium heat.",
          "Add the onion and garlic and cook until softened, about 5-7 minutes.",
          "Stir in the rice, black beans, corn, salsa, and cilantro.",
          "Fill the bell peppers with the rice mixture.",
          "Place the bell peppers in a baking dish.",
          "Top with the cheddar cheese.",
          "Bake for 30-35 minutes, or until the bell peppers are tender and the cheese is melted.",
          "Serve immediately.",
        ],
      },
      {
        id: "vegetarian-9",
        title: "Chickpea Curry",
        cookTime: "30 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 tablespoon olive oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 tablespoon grated ginger",
          "2 tablespoons curry powder",
          "1 teaspoon turmeric",
          "1/2 teaspoon cumin",
          "1/4 teaspoon cayenne pepper (optional)",
          "1 (14.5-ounce) can diced tomatoes, undrained",
          "1 (13.5-ounce) can coconut milk",
          "2 (15-ounce) cans chickpeas, drained and rinsed",
          "Fresh cilantro, chopped",
          "Rice for serving",
        ],
        instructions: [
          "Heat the olive oil in a large pot over medium heat.",
          "Add the onion and cook until softened, about 5-7 minutes.",
          "Add the garlic and ginger and cook for 1 minute more.",
          "Stir in the curry powder, turmeric, cumin, and cayenne pepper (if using).",
          "Cook for 1 minute more.",
          "Stir in the diced tomatoes and coconut milk.",
          "Bring to a boil, then reduce heat and simmer for 15 minutes.",
          "Stir in the chickpeas.",
          "Heat through.",
          "Garnish with fresh cilantro.",
          "Serve over rice.",
        ],
      },
      {
        id: "vegetarian-10",
        title: "Vegetable Paella",
        cookTime: "45 mins",
        servings: "6 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 tablespoons olive oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 red bell pepper, chopped",
          "1 green bell pepper, chopped",
          "1 cup sliced carrots",
          "1 cup green beans, trimmed",
          "1 cup artichoke hearts, quartered",
          "1 (14.5-ounce) can diced tomatoes, undrained",
          "4 cups vegetable broth",
          "1 teaspoon saffron threads",
          "1 1/2 cups paella rice",
          "1 cup frozen peas",
          "Lemon wedges",
        ],
        instructions: [
          "Heat the olive oil in a paella pan or large skillet over medium heat.",
          "Add the onion and garlic and cook until softened, about 5-7 minutes.",
          "Add the red bell pepper, green bell pepper, carrots, green beans, and artichoke hearts.",
          "Cook until the vegetables are tender-crisp, about 5-7 minutes.",
          "Stir in the diced tomatoes, vegetable broth, and saffron threads.",
          "Bring to a boil, then reduce heat and simmer for 10 minutes.",
          "Stir in the rice.",
          "Cook, without stirring, until the rice is tender and the liquid is absorbed, about 20-25 minutes.",
          "Stir in the peas.",
          "Let rest for 5 minutes before serving.",
          "Garnish with lemon wedges.",
        ],
      },
    ],
    quick: [
      {
        id: "quick-1",
        title: "Avocado Toast",
        cookTime: "5 mins",
        servings: "1 serving",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 slice bread, toasted",
          "1/2 avocado, mashed",
          "Salt and pepper to taste",
          "Optional: red pepper flakes, everything bagel seasoning",
        ],
        instructions: [
          "Toast the bread.",
          "Mash the avocado and spread it on the toast.",
          "Season with salt and pepper.",
          "Add red pepper flakes or everything bagel seasoning if desired.",
          "Serve immediately.",
        ],
      },
      {
        id: "quick-2",
        title: "Quesadillas",
        cookTime: "10 mins",
        servings: "2 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "4 flour tortillas",
          "2 cups shredded cheddar cheese",
          "Optional: cooked chicken, black beans, salsa",
        ],
        instructions: [
          "Sprinkle cheese on half of each tortilla.",
          "Add cooked chicken, black beans, or salsa if desired.",
          "Fold the tortillas in half.",
          "Cook in a skillet over medium heat until the cheese is melted and the tortillas are golden brown, about 3-5 minutes per side.",
          "Serve immediately.",
        ],
      },
      {
        id: "quick-3",
        title: "Egg Fried Rice",
        cookTime: "15 mins",
        servings: "2 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 cups cooked rice",
          "2 eggs",
          "1 tablespoon soy sauce",
          "1/2 cup frozen peas and carrots",
          "1 tablespoon sesame oil",
          "Optional: chopped green onions",
        ],
        instructions: [
          "Whisk the eggs in a bowl.",
          "Heat the sesame oil in a skillet or wok over medium heat.",
          "Add the eggs and cook until scrambled.",
          "Add the rice, soy sauce, and frozen peas and carrots.",
          "Cook, stirring constantly, until heated through, about 5-7 minutes.",
          "Add chopped green onions if desired.",
          "Serve immediately.",
        ],
      },
      {
        id: "quick-4",
        title: "Tuna Melt",
        cookTime: "10 mins",
        servings: "1 serving",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 slices bread",
          "1 (5-ounce) can tuna, drained",
          "1/4 cup mayonnaise",
          "1/4 cup chopped celery",
          "1/4 cup shredded cheddar cheese",
        ],
        instructions: [
          "Combine the tuna, mayonnaise, and celery in a bowl.",
          "Spread the tuna mixture on one slice of bread.",
          "Top with the cheddar cheese and the other slice of bread.",
          "Cook in a skillet over medium heat until the cheese is melted and the bread is golden brown, about 3-5 minutes per side.",
          "Serve immediately.",
        ],
      },
      {
        id: "quick-5",
        title: "Microwave Baked Potato",
        cookTime: "8 mins",
        servings: "1 serving",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 baking potato",
          "Olive oil",
          "Salt and pepper to taste",
          "Toppings of your choice (butter, sour cream, cheese, etc.)",
        ],
        instructions: [
          "Wash and dry the potato.",
          "Pierce the potato several times with a fork.",
          "Rub the potato with olive oil and season with salt and pepper.",
          "Microwave on high for 5-8 minutes, or until the potato is tender.",
          "Top with your favorite toppings.",
          "Serve immediately.",
        ],
      },
      {
        id: "quick-6",
        title: "Instant Ramen Upgrade",
        cookTime: "10 mins",
        servings: "1 serving",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: ["1 package instant ramen", "1 egg", "1/4 cup frozen vegetables", "Optional: soy sauce, sriracha"],
        instructions: [
          "Cook the ramen according to package directions.",
          "Add the egg and frozen vegetables during the last minute of cooking.",
          "Stir well.",
          "Add soy sauce or sriracha if desired.",
          "Serve immediately.",
        ],
      },
      {
        id: "quick-7",
        title: "Hummus Wrap",
        cookTime: "5 mins",
        servings: "1 serving",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: ["1 tortilla", "Hummus", "Shredded lettuce", "Chopped cucumber", "Chopped tomatoes"],
        instructions: [
          "Spread hummus on the tortilla.",
          "Top with shredded lettuce, chopped cucumber, and chopped tomatoes.",
          "Wrap the tortilla.",
          "Serve immediately.",
        ],
      },
      {
        id: "quick-8",
        title: "Caprese Sandwich",
        cookTime: "5 mins",
        servings: "1 serving",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 slices bread",
          "Fresh mozzarella, sliced",
          "Tomato, sliced",
          "Fresh basil leaves",
          "Balsamic glaze",
        ],
        instructions: [
          "Layer mozzarella, tomato, and basil leaves on one slice of bread.",
          "Drizzle with balsamic glaze.",
          "Top with the other slice of bread.",
          "Serve immediately.",
        ],
      },
      {
        id: "quick-9",
        title: "Scrambled Eggs",
        cookTime: "5 mins",
        servings: "2 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: ["2 eggs", "1 tablespoon milk", "Salt and pepper to taste", "Butter"],
        instructions: [
          "Whisk the eggs and milk in a bowl.",
          "Season with salt and pepper.",
          "Melt butter in a skillet over medium heat.",
          "Pour the egg mixture into the skillet.",
          "Cook, stirring occasionally, until the eggs are set.",
          "Serve immediately.",
        ],
      },
      {
        id: "quick-10",
        title: "Greek Yogurt Parfait",
        cookTime: "5 mins",
        servings: "1 serving",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: ["Greek yogurt", "Granola", "Berries", "Honey (optional)"],
        instructions: [
          "Layer Greek yogurt, granola, and berries in a glass or bowl.",
          "Drizzle with honey if desired.",
          "Serve immediately.",
        ],
      },
    ],
    all: [
      {
        id: "all-1",
        title: "Spaghetti Carbonara",
        cookTime: "20 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pound spaghetti",
          "4 ounces pancetta, cubed",
          "2 eggs",
          "1/2 cup grated Parmesan cheese",
          "1/4 cup heavy cream",
          "Salt and pepper to taste",
        ],
        instructions: [
          "Cook the spaghetti according to package directions.",
          "While the spaghetti is cooking, cook the pancetta in a skillet over medium heat until crispy.",
          "In a bowl, whisk together the eggs, Parmesan cheese, and heavy cream.",
          "Season with salt and pepper.",
          "Drain the spaghetti and add it to the skillet with the pancetta.",
          "Pour the egg mixture over the spaghetti and toss to combine.",
          "Serve immediately.",
        ],
      },
      {
        id: "all-2",
        title: "Beef Burger",
        cookTime: "30 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pound ground beef",
          "1 egg",
          "1/4 cup bread crumbs",
          "1 tablespoon Worcestershire sauce",
          "Salt and pepper to taste",
          "4 burger buns",
          "Toppings of your choice (lettuce, tomato, onion, cheese, etc.)",
        ],
        instructions: [
          "In a bowl, combine the ground beef, egg, bread crumbs, Worcestershire sauce, salt, and pepper.",
          "Mix well.",
          "Shape the mixture into 4 patties.",
          "Cook the patties on a grill or in a skillet over medium heat until cooked through, about 5-7 minutes per side.",
          "Serve on burger buns with your favorite toppings.",
        ],
      },
      {
        id: "all-3",
        title: "Chicken Curry",
        cookTime: "45 mins",
        servings: "6 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 pounds boneless, skinless chicken thighs, cubed",
          "2 tablespoons vegetable oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 tablespoon grated ginger",
          "2 tablespoons curry powder",
          "1 teaspoon turmeric",
          "1/2 teaspoon cumin",
          "1/4 teaspoon cayenne pepper (optional)",
          "1 (14.5-ounce) can diced tomatoes, undrained",
          "1 (13.5-ounce) can coconut milk",
          "Fresh cilantro, chopped",
          "Rice for serving",
        ],
        instructions: [
          "Heat the vegetable oil in a large pot or Dutch oven over medium-high heat.",
          "Add the chicken and brown on all sides.",
          "Remove the chicken and set aside.",
          "Add the onion to the pot and cook until softened, about 5-7 minutes.",
          "Add the garlic and ginger and cook for 1 minute more.",
          "Stir in the curry powder, turmeric, cumin, and cayenne pepper (if using).",
          "Cook for 1 minute more.",
          "Stir in the diced tomatoes and coconut milk.",
          "Bring to a boil, then reduce heat and simmer for 30 minutes.",
          "Return the chicken to the pot and heat through.",
          "Garnish with fresh cilantro.",
          "Serve over rice.",
        ],
      },
      {
        id: "all-4",
        title: "Vegetable Stir Fry",
        cookTime: "15 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 tablespoon olive oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 red bell pepper, sliced",
          "1 green bell pepper, sliced",
          "1 cup broccoli florets",
          "1 cup sliced carrots",
          "1/4 cup soy sauce",
          "2 tablespoons sesame oil",
          "1 tablespoon cornstarch",
        ],
        instructions: [
          "Heat the olive oil in a large skillet or wok over medium-high heat.",
          "Add the onion and garlic and cook until softened, about 5-7 minutes.",
          "Add the red bell pepper, green bell pepper, broccoli florets, and carrots.",
          "Cook until the vegetables are tender-crisp, about 5-7 minutes.",
          "In a small bowl, whisk together the soy sauce, sesame oil, and cornstarch.",
          "Pour the sauce over the vegetables and cook until thickened, about 1-2 minutes.",
          "Serve immediately over rice or noodles.",
        ],
      },
      {
        id: "all-5",
        title: "Chocolate Cake",
        cookTime: "1 hour",
        servings: "12 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "2 cups all-purpose flour",
          "2 cups sugar",
          "3/4 cup unsweetened cocoa powder",
          "1 1/2 teaspoons baking powder",
          "1 1/2 teaspoons baking soda",
          "1 teaspoon salt",
          "1 cup buttermilk",
          "1/2 cup vegetable oil",
          "2 eggs",
          "2 teaspoons vanilla extract",
          "1 cup boiling water",
        ],
        instructions: [
          "Preheat oven to 350°F (175°C).",
          "Grease and flour a 9x13 inch baking pan.",
          "In a large bowl, combine the flour, sugar, cocoa powder, baking powder, baking soda, and salt.",
          "In another bowl, combine the buttermilk, vegetable oil, eggs, and vanilla extract.",
          "Add the wet ingredients to the dry ingredients and mix well.",
          "Stir in the boiling water.",
          "Pour the batter into the prepared pan.",
          "Bake for 30-35 minutes, or until a toothpick inserted into the center comes out clean.",
          "Let cool completely before frosting.",
        ],
      },
      {
        id: "all-6",
        title: "Grilled Salmon",
        cookTime: "20 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "4 (6-ounce) salmon fillets",
          "2 tablespoons olive oil",
          "1 lemon, sliced",
          "Salt and pepper to taste",
          "Fresh dill sprigs",
        ],
        instructions: [
          "Preheat grill to medium heat.",
          "Brush the salmon fillets with olive oil.",
          "Season with salt and pepper.",
          "Place the salmon fillets on the grill.",
          "Grill for 5-7 minutes per side, or until cooked through.",
          "Top with lemon slices and fresh dill sprigs.",
          "Serve immediately.",
        ],
      },
      {
        id: "all-7",
        title: "Mushroom Risotto",
        cookTime: "40 mins",
        servings: "4 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "6 cups vegetable broth",
          "2 tablespoons olive oil",
          "1 onion, chopped",
          "2 cloves garlic, minced",
          "1 1/2 cups Arborio rice",
          "1/2 cup dry white wine",
          "8 ounces mushrooms, sliced",
          "1/2 cup grated Parmesan cheese",
          "2 tablespoons butter",
          "Salt and pepper to taste",
          "Fresh parsley, chopped",
        ],
        instructions: [
          "Heat the vegetable broth in a saucepan and keep warm.",
          "Heat the olive oil in a large pot over medium heat.",
          "Add the onion and garlic and cook until softened, about 5-7 minutes.",
          "Add the rice and cook for 1 minute.",
          "Stir in the white wine and cook until absorbed.",
          "Add the mushrooms and cook until softened, about 5-7 minutes.",
          "Add 1 cup of the warm vegetable broth to the rice and stir until absorbed.",
          "Continue adding the broth, 1 cup at a time, stirring until absorbed before adding the next cup.",
          "Cook until the rice is creamy and al dente, about 20-25 minutes.",
          "Stir in the Parmesan cheese and butter.",
          "Season with salt and pepper to taste.",
          "Garnish with fresh parsley.",
          "Serve immediately.",
        ],
      },
      {
        id: "all-8",
        title: "Beef Tacos",
        cookTime: "25 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 pound ground beef",
          "1 packet taco seasoning",
          "1/2 cup water",
          "12 taco shells",
          "Shredded lettuce",
          "Chopped tomatoes",
          "Shredded cheddar cheese",
          "Salsa",
          "Sour cream",
        ],
        instructions: [
          "Brown the ground beef in a large skillet over medium heat.",
          "Drain off any excess grease.",
          "Stir in the taco seasoning and water.",
          "Bring to a boil, then reduce heat and simmer for 5 minutes.",
          "Warm the taco shells according to package directions.",
          "Fill the taco shells with the beef mixture.",
          "Top with shredded lettuce, chopped tomatoes, shredded cheddar cheese, salsa, and sour cream.",
          "Serve immediately.",
        ],
      },
      {
        id: "all-9",
        title: "Apple Pie",
        cookTime: "1 hour",
        servings: "8 servings",
        difficulty: "Medium",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 box (14.1 ounces) refrigerated pie crusts",
          "6 cups peeled and sliced apples",
          "3/4 cup sugar",
          "2 tablespoons all-purpose flour",
          "1 teaspoon ground cinnamon",
          "1/4 teaspoon ground nutmeg",
          "2 tablespoons butter, cut into small pieces",
          "1 egg, beaten",
        ],
        instructions: [
          "Preheat oven to 375°F (190°C).",
          "Line a 9-inch pie plate with one pie crust.",
          "In a large bowl, combine the apples, sugar, flour, cinnamon, and nutmeg.",
          "Pour the apple mixture into the pie crust.",
          "Dot with butter.",
          "Cover with the second pie crust.",
          "Crimp the edges to seal.",
          "Cut slits in the top crust to vent steam.",
          "Brush with the beaten egg.",
          "Bake for 45-50 minutes, or until the crust is golden brown and the filling is bubbly.",
          "Let cool completely before serving.",
        ],
      },
      {
        id: "all-10",
        title: "Caesar Salad",
        cookTime: "15 mins",
        servings: "4 servings",
        difficulty: "Easy",
        imageUrl: "/placeholder.svg?height=200&width=300",
        ingredients: [
          "1 head romaine lettuce, washed and chopped",
          "1 cup croutons",
          "1/2 cup grated Parmesan cheese",
          "Caesar dressing (store-bought or homemade)",
          "Optional: grilled chicken or shrimp",
        ],
        instructions: [
          "In a large bowl, combine the romaine lettuce, croutons, and Parmesan cheese.",
          "Add Caesar dressing to taste and toss gently to coat.",
          "If desired, top with grilled chicken or shrimp.",
          "Serve immediately.",
        ],
      },
    ],
  }

  // Return recipes for the selected category, or default to "all" if category not found
  return recipesByCategory[categoryId] || recipesByCategory.all
}
