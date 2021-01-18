
#CREATE FUNCTIONS
ስሌት = ስራ(ስም ፣ አድሜ) {
    #IF - THEN STATEMENT
    ከ አድሜ <= 18 ወደ{
        ፃፍ(ስም)፤
        ፃፍ(" ይቅርታ ግን መንዳት አይቻልም።")፤
    } 

    #ELSE STATEMENT
    ሌላ {
        ፃፍ(ስም)፤
        ፃፍ(" እናመሰግናለን።")፤
        }፤
    }፤ 

#CALLING THE FUNCTIONS
ፃፍ(ስሌት("አቡቹ" ፣ 19))፤

#LIST LIKE LISP
ቤት = ስራ(x ፣ y)
            ስራ(a፣ i፣ v)
                ከ a == "አግኝ"
                    ወደ ከ i == 0 ወደ x
                 ሌላ y
                     ሌላ ከ i == 0 ወደ x = v
                 ሌላ y = v፤
ብጀ = ስራ(ክፍል) ክፍል("አግኝ"፣ 0)፤
ብቀ = ስራ(ክፍል) ክፍል ("አግኝ"፣ 1)፤
ሰይም-ብጀ! = ስራ(ክፍል፣ ተለዋጭ) ክፍል("ሰይም"፣ 0፣ ተለዋጭ)፤
ሰይም-ብቀ! = ስራ(ክፍል፣ ተለዋጭ) ክፍል("ሰይም"፣ 1፣ ተለዋጭ)፤
ባዶ = ቤት(0፣0)፤
ሰይም-ብጀ!(ባዶ፣ባዶ)፤
ሰይም-ብቀ!(ባዶ፣ባዶ)፤

ዝርዝር = ቤት(1 ፣ ቤት(2 ፣ ቤት(3 ፣ ቤት(4 ፣ ቤት(5 ፣ ቤት(6 ፣ ቤት(7 ፣ ባዶ)))))))፤
መስ_ፃፍ(ብጀ(ዝርዝር))፤
መስ_ፃፍ(ብጀ(ብቀ(ዝርዝር)))፤
መስ_ፃፍ(ብጀ(ብቀ(ብቀ(ዝርዝር))))፤
መስ_ፃፍ(ብጀ(ብቀ(ብቀ(ብቀ(ዝርዝር)))))፤
መስ_ፃፍ(ብጀ(ብቀ(ብቀ(ብቀ(ብቀ(ዝርዝር))))))፤
ፃፍ(ብጀ(ብቀ(ብቀ(ብቀ(ብቀ(ብቀ(ብቀ(ዝርዝር))))))))፤
ለያንዳንዱ = ስራ(ዝር ፣ ስ) 
               ከ ዝር != ባዶ {
                      ስ(ብጀ(ዝር))፤
                      ለያንዳንዱ(ብቀ(ዝር)፣ ስ)፤
               }፤

ዘርዝር = ስራ(ሀ፣ ለ)
                ከ ሀ <= ለ ወደ ቤት(ሀ፣ ዘርዝር(ሀ+1 ፣ለ))
                ሌላ ባዶ፤

#FOREACH FUNCTION
ለያንዳንዱ(ዝርዝር፣ ፃፍ)፤
ፃፍ("")፤
ለያንዳንዱ(ዘርዝር(1፣8)፣ ስራ(ሀ) ፃፍ(ሀ * ሀ))፤
ሀ = ቤት(1፣2)፤
ፃፍ(ብጀ(ሀ))፤
ፃፍ(ብቀ(ሀ))፤

#SETTING LIST VARIABLES TO SHOW MUTABLE LIST IN LISP
ሰይም-ብጀ!(ሀ፣10)፤
ሰይም-ብቀ!(ሀ፣20)፤
ፃፍ(ብጀ(ሀ))፤
ፃፍ(ብቀ(ሀ))፤


#fOR LOOP IMPLEMENTATION
ይሁን ዙረት (x = 99) ከ x > 0 { 
    ፃፍ(x)፤
    ዙረት(x - 1)፤
}፤
ፃፍ("ጨረስን")፤


#This is a rough implementation of the program and the way to run it is by
#To run the code there needs to be a node.js installed on the system 
#If node is installed
#Run the code in the terminal by using cat command
#cat test.gz | node geez.js

#Test out some programs using this simple LISP style programming language interpreter in javascript

